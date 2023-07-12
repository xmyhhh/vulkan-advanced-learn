## The Inverse Transform Method
Inverse transform sampling is a method for generating random numbers from any probability distribution by using its inverse cumulative distribution function.

### Continuous Distributions Sampling
The cumulative distribution function(CDF) for a random variable $X$ represents:
$$
F_X(x)=P(X \leq x)
$$

We can sample variable $X$ by two step:
* Generate $U∼uniform(0,1)$
* Let $X=F^{−1}X(U)$

### Discrete Distributions Sampling
[read hear](https://stephens999.github.io/fiveMinuteStats/inverse_transform_sampling.html)

## Sampling GGX
Basic form of GGX represents:
$$
D(h)=\frac{\alpha^2}{\pi\left(\left(\alpha^2-1\right) \cos ^2 \theta+1\right)^2}
$$
Here, $\cos\theta = dot(N, H)$ and $H = normalize (V + L) $.


The PDF respecting solid angle represents(As suggested in the Disney
course notes):
$$
p_h(h)=\frac{\alpha^2\cos\theta}{\pi\left(\left(\alpha^2-1\right) \cos ^2 \theta+1\right)^2}
$$

We can respecting above equation as spherical coordinate:
$$
p_h(\theta, \phi)=\frac{\alpha^2 \cos \theta \sin \theta}{\pi\left(\left(\alpha^2-1\right) \cos ^2 \theta+1\right)^2}
$$

And we can calculate marginal density function $p_h(\theta)$ by integral on $\phi$:
$$
p_h(\theta)=\int_0^{2 \pi} p_h(\theta, \phi) d \phi=\frac{2 \alpha^2 \cos \theta \sin \theta}{\left(\left(\alpha^2-1\right) \cos ^2 \theta+1\right)^2}
$$

Then conditional density for $\phi$ writes:
$$\mathrm{p_h}(\phi \mid \theta)=\frac{\mathrm{p_h}(\theta, \phi)}{\mathrm{p}_\theta(\theta)}=\frac{1}{2 \pi}$$

And the CDF of $\phi$ writes:
$$\mathrm{P_h}(\phi \mid \theta)=\int_0^\phi \frac{1}{2 \pi} d \phi^{\prime}=\frac{1}{2 \pi} \phi$$



Let’s calculate the CDF of $\theta$ next:
$$
\begin{aligned}
F_h(\theta) & =\int_0^\theta \frac{2 \alpha^2 \cos (t) \sin (t)}{\left(\cos ^2 t\left(\alpha^2-1\right)+1\right)^2} d t \\
& =\int_\theta^0 \frac{\alpha^2}{\left(\cos ^2 t\left(\alpha^2-1\right)+1\right)^2} d\left(\cos ^2 t\right) \\
& =\frac{\alpha^2}{\alpha^2-1} \int_0^\theta d \frac{1}{\cos ^2 t\left(\alpha^2-1\right)+1} \\
& =\frac{\alpha^2}{\alpha^2-1}\left(\frac{1}{\cos ^2 \theta\left(\alpha^2-1\right)+1}-\frac{1}{\alpha^2}\right) \\
& =\frac{\alpha^2}{\cos ^2 \theta\left(\alpha^2-1\right)^2+\left(\alpha^2-1\right)}-\frac{1}{\alpha^2-1} \\
& = v
\end{aligned}
$$

The inversion for $\phi$:
$$u=\mathrm{P}(\phi \mid \theta)=\frac{1}{2 \pi} \phi \quad \Rightarrow \quad \phi=2 \pi u$$

The inversion for $\theta$:

$$
\theta=\arccos \sqrt{\frac{1-v}{v\left(\alpha^2-1\right)+1}} \operatorname{or} \theta=\arctan \left(\alpha \sqrt{\frac{v}{1-v}}\right)
$$


```glsl
//code of Sampling GGX
//float2 Xi is a uniformly distributed random value
float3 ImportanceSampleGGX( float2 Xi, float Roughness, float3 N )
{


    // Calculate phi and cosine of theta
    float a = Roughness * Roughness;
    float Phi = 2 * PI * Xi.x;
    float CosTheta = sqrt( (1 - Xi.y) / ( 1 + (a*a - 1) * Xi.y ) );
    float SinTheta = sqrt( 1 - CosTheta * CosTheta );

    // Build a half vector
    float3 H;
    H.x = SinTheta * cos( Phi );
    H.y = SinTheta * sin( Phi );
    H.z = CosTheta;

    // Transform the vector from tangent space to world space
    float3 UpVector = abs(N.z) < 0.999 ? float3(0,0,1) : float3(1,0,0);
    float3 right = normalize( cross( UpVector, N ) );
    float3 forward = cross( N, right );

    return right * H.x + forward * H.y + N * H.z;
}
```

## Sampling Beckmann
[read hear](https://stephens999.github.io/fiveMinuteStats/inverse_transform_sampling.html)

## Sampling Blinn
[read hear](https://stephens999.github.io/fiveMinuteStats/inverse_transform_sampling.html)