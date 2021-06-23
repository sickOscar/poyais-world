export function Singleton(Klass:any) {
  const singleton = function() {
    let _instance:any;
    return {
      getInstance() {
        if (!_instance) {
          _instance = new Klass()
        }
        return _instance
      }
    }
  }
  return singleton().getInstance();
}
