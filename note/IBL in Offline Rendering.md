### The Reflectance Equation


$$L_o\left(p, \omega_o\right)=\int_{\Omega}\left(k_d \frac{c}{\pi}+k_s \frac{D F G}{4\left(\omega_o \cdot n\right)\left(\omega_i \cdot n\right)}\right) L_i\left(p, \omega_i\right) n \cdot \omega_i d \omega_i$$

### Pre-Filter Environment Map
 given any direction vector $\omega_i$, we can get the scene's radiance by environment cubemap:

 ```glsl
 vec3 radiance = texture(cubemapEnvironment, w_i).rgb;  
 ```

solving the integral requires us to sample the environment map from not just one direction, but all possible directions $\omega_i$ over the hemisphere $Ω$

 ### Environment BRDF