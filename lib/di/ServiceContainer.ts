type Constructor<T = Record<string, unknown>> = new (...args: unknown[]) => T
type ServiceFactory<T> = () => T

export class ServiceContainer {
  private services: Map<string, unknown> = new Map()
  private singletons: Map<string, unknown> = new Map()
  private factories: Map<string, ServiceFactory<unknown>> = new Map()
  private factoryServices: Map<string, ServiceFactory<unknown>> = new Map()

  // Register a singleton service
  registerSingleton<T>(key: string, constructor: Constructor<T> | ServiceFactory<T>): void {
    if (typeof constructor === 'function' && constructor.prototype) {
      // It's a constructor
      this.factories.set(key, () => new (constructor as Constructor<T>)())
    } else {
      // It's a factory function
      this.factories.set(key, constructor as ServiceFactory<T>)
    }
  }

  // Register a transient service (new instance each time)
  registerTransient<T>(key: string, constructor: Constructor<T> | ServiceFactory<T>): void {
    if (typeof constructor === 'function' && constructor.prototype) {
      this.services.set(key, constructor)
    } else {
      this.services.set(key, constructor)
    }
  }

  // Register an instance
  registerInstance<T>(key: string, instance: T): void {
    this.singletons.set(key, instance)
  }

  // Resolve a service
  resolve<T>(key: string): T {
    // Check if it's already a singleton instance
    if (this.singletons.has(key)) {
      return this.singletons.get(key) as T
    }

    // Check if it's a singleton factory
    if (this.factories.has(key)) {
      const factory = this.factories.get(key)
      if (factory) {
        const instance = factory()
        this.singletons.set(key, instance)
        return instance as T
      }
    }

    // Check if it's a transient service
    if (this.services.has(key)) {
      const constructor = this.services.get(key)
      if (typeof constructor === 'function' && constructor.prototype) {
        return new (constructor as Constructor<T>)()
      } else {
        return (constructor as ServiceFactory<T>)()
      }
    }

    throw new Error(`Service '${key}' not found in container`)
  }

  // Check if service is registered
  has(key: string): boolean {
    return this.services.has(key) || this.singletons.has(key) || this.factories.has(key)
  }

  // Clear all services
  clear(): void {
    this.services.clear()
    this.singletons.clear()
    this.factories.clear()
  }
}

// Global service container instance
export const serviceContainer = new ServiceContainer()
