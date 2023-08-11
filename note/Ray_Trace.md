<h1 align='center' >1. Prerequisite</h1>

### 1.1 Plane Intersection
- Implicit formula for a plane:
$$
A x+B y+C z+D=0
$$
- given the plane normal vector $n=(A,B,C)$, and any point on the plane $v=(x,y,z)$, we can use the dot product to solve for $D$
$$
\mathbf{n} \cdot \mathbf{v}=D
$$
- The intersection with ray $R(t)=\mathbf{P}+t \mathbf{d}$
$$
\mathbf{n} \cdot(\mathbf{P}+t \mathbf{d})=D
$$
$$
t=\frac{D-\mathbf{n} \cdot \mathbf{P}}{\mathbf{n} \cdot \mathbf{d}}
$$