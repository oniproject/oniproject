package artemis

type BaseEntityObserver struct{}

func (b *BaseEntityObserver) Added(e Entity)    {}
func (b *BaseEntityObserver) Changed(e Entity)  {}
func (b *BaseEntityObserver) Deleted(e Entity)  {}
func (b *BaseEntityObserver) Enabled(e Entity)  {}
func (b *BaseEntityObserver) Disabled(e Entity) {}

type BaseWorldSaver struct{ world *World }

func (b *BaseWorldSaver) World() *World     { return b.world }
func (b *BaseWorldSaver) SetWorld(w *World) { b.world = w }

type BaseInitializer struct{}

func (b *BaseInitializer) Initialize() {}
