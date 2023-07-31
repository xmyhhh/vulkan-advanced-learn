<h1 align='center' >1. Prerequisite</h1>

### 1.1 [Homogeneous Coordinates and Transform Matrix](https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/projection-matrices-what-you-need-to-know-first.html)
**Homogeneous Coordinates: **To multiply a 3D point by a 4x4 matrix, we need to convert the point's Cartesian coordinates to homogeneous coordinates.

The fourth coordinate of a point in its homogeneous representation is denoted by the letter $w$. When we convert a point from Cartesian to homogeneous coordinates, $w$ is set equal to 1.

**Affine Transform Matrix:** A 3D cartesian point P converted to a point with homogeneous coordinates ${x, y, z, w = 1}$, and multiplied by a 4x4 affine transformation matrix, always gives a point P' with homogeneous coordinates and whose $w$ is always equal to 1.

**Projection Matrix** ：do not keep the transformed points w-coordinate equal to 1, a point transformed by a projection matrix will thus require the $x'$ $y'$ and $z'$ coordinates to be normalized.

<h1 align='center' >2. Vulkan Coordinate System</h1>

### 2.1 NDC space [1](https://anki3d.org/vulkan-coordinate-system/) [2](http://matthewwellings.com/blog/the-new-vulkan-coordinate-system/)
In OpenGL we had a left-hand NDC space, in Vulkan we have a right hand NDC space