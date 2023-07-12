### Standard Reflection Equation
[$$float3\quad L = 2 * dot ( V , N ) * N - V$$](https://blog.csdn.net/yinhun2012/article/details/79466517)
### Reflectance Equation
$$L_o\left(p, \omega_o\right)=\int_{\Omega}\left(k_d \frac{c}{\pi}+k_s \frac{D F G}{4\left(\omega_o \cdot n\right)\left(\omega_i \cdot n\right)}\right) L_i\left(p, \omega_i\right) n \cdot \omega_i d \omega_i$$

the diffuse $k_d$ and specular $k_s$ term of the BRDF are independent from each other and we can split the integral in two:
$$L_o\left(p, \omega_o\right)=\int_{\Omega}\left(k_d \frac{c}{\pi}\right) L_i\left(p, \omega_i\right) n \cdot \omega_i d \omega_i+\int_{\Omega}\left(k_s \frac{D F G}{4\left(\omega_o \cdot n\right)\left(\omega_i \cdot n\right)}\right) L_i\left(p, \omega_i\right) n \cdot \omega_i d \omega_i$$

### Diffuse Integral Part(Irradiance Map)
the color $c$ ,the refraction ratio $k_d$ and $π$ are constant over the integral, we can move the constant term out of the diffuse integral:
$$L_{o\_diffuse}\left(p, \omega_o\right)=k_d \frac{c}{\pi} \int_{\Omega} L_i\left(p, \omega_i\right) n \cdot \omega_i d \omega_i$$

With this knowledge, we can calculate or pre-compute a cubemap that stores in each sample direction. This pre-computed cubemap can be thought of as the pre-computed sum of all indirect diffuse light of the scene hitting some surface aligned along direction $\omega_o$ and is known as an irradiance map.
![本地路径](./pics/ibl_irradiance_map.png "相对路径演示") 
### Pre-Filter Environment Map
 given any direction vector $\omega_i$, we can get the scene's radiance by environment cubemap:

 ```glsl
 vec3 radiance = texture(cubemapEnvironment, w_i).rgb;  
 ```

solving the integral requires us to sample the environment map from not just one direction, but all possible directions $\omega_i$ over the hemisphere $Ω$

 ### Environment BRDF