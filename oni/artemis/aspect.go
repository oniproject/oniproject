package artemis

import (
	"github.com/willf/bitset"
)

/**
 * An Aspects is used by systems as a matcher against entities, to check if a system is
 * interested in an entity. Aspects define what sort of component types an entity must
 * possess, or not possess.
 *
 * This creates an aspect where an entity must possess A and B and C:
 * Aspect.getAspectForAll(A.class, B.class, C.class)
 *
 * This creates an aspect where an entity must possess A and B and C, but must not possess U or V.
 * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class)
 *
 * This creates an aspect where an entity must possess A and B and C, but must not possess U or V, but must possess one of X or Y or Z.
 * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class).one(X.class, Y.class, Z.class)
 *
 * You can create and compose aspects in many ways:
 * Aspect.getEmpty().one(X.class, Y.class, Z.class).all(A.class, B.class, C.class).exclude(U.class, V.class)
 * is the same as:
 * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class).one(X.class, Y.class, Z.class)
 *
 * @author Arni Arent
 *
 */
type Aspect struct {
	allSet, exclusionSet, oneSet *bitset.BitSet
}

/**
 * Creates and returns an empty aspect. This can be used if you want a system that processes no entities, but
 * still gets invoked. Typical usages is when you need to create special purpose systems for debug rendering,
 * like rendering FPS, how many entities are active in the world, etc.
 *
 * You can also use the all, one and exclude methods on this aspect, so if you wanted to create a system that
 * processes only entities possessing just one of the components A or B or C, then you can do:
 * Aspect.getEmpty().one(A,B,C);
 *
 * @return an empty Aspect that will reject all entities.
 */
func NewAspect() *Aspect {
	return &Aspect{
		allSet:       bitset.New(0),
		exclusionSet: bitset.New(0),
		oneSet:       bitset.New(0),
	}
}

/**
 * Creates an aspect where an entity must possess all of the specified component types.
 *
 * @param types the type the entity must possess
 * @return an aspect that can be matched against entities
 *
 * @deprecated
 * @see getAspectForAll
 */
func NewAspectFor(types ...Component) *Aspect {
	return NewAspectForAll(types)
}

/**
 * Creates an aspect where an entity must possess all of the specified component types.
 *
 * @param types a required component type
 * @return an aspect that can be matched against entities
 */
func NewAspectForAll(types ...Component) (aspect *Aspect) {
	aspect = NewAspect()
	aspect.All(types...)
	return
}

/**
 * Creates an aspect where an entity must possess one of the specified component types.
 *
 * @param types one of the types the entity must possess
 * @return an aspect that can be matched against entities
 */
func NewAspectForOne(types ...Component) (aspect *Aspect) {
	aspect = NewAspect()
	aspect.One(types...)
	return
}

/**
 * Returns an aspect where an entity must possess all of the specified component types.
 * @param types a required component type
 * @return an aspect that can be matched against entities
 */
func (a *Aspect) All(types ...Component) *Aspect {
	for _, t := range types {
		a.allSet.Set(uint(getIndexFor(t)))
	}
	return a
}

/**
 * Excludes all of the specified component types from the aspect. A system will not be
 * interested in an entity that possesses one of the specified exclusion component types.
 *
 * @param types component type to exclude
 * @return an aspect that can be matched against entities
 */
func (a *Aspect) Exclude(types ...Component) *Aspect {
	for _, t := range types {
		a.exclusionSet.Set(uint(getIndexFor(t)))
	}
	return a
}

/**
 * Returns an aspect where an entity must possess one of the specified component types.
 * @param types one of the types the entity must possess
 * @return an aspect that can be matched against entities
 */
func (a *Aspect) One(types ...Component) *Aspect {
	for _, t := range types {
		a.oneSet.Set(uint(getIndexFor(t)))
	}
	return a
}
