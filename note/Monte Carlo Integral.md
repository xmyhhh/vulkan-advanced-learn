## The Inverse Transform Method(逆采样变换方法)
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

The PDF respecting solid angle represents:
$$
D(h)=\frac{\alpha^2\cos\theta}{\pi\left(\left(\alpha^2-1\right) \cos ^2 \theta+1\right)^2}
$$

We can respecting above equation as spherical coordinate:
$$
p_h(\theta, \phi)=\frac{\alpha^2 \cos \theta \sin \theta}{\pi\left(\left(\alpha^2-1\right) \cos ^2 \theta+1\right)^2}
$$

And we can calculate $p_h(\theta)$ by integral on $\phi$:
$$
p_h(\theta)=\int_0^{2 \pi} p_h(\theta, \phi) d \phi=\frac{2 \alpha^2 \cos \theta \sin \theta}{\left(\left(\alpha^2-1\right) \cos ^2 \theta+1\right)^2}
$$

Let’s calculate the CDF next:
$$
\begin{aligned}
F_h(\theta) & =\int_0^\theta \frac{2 \alpha^2 \cos (t) \sin (t)}{\left(\cos ^2 t\left(\alpha^2-1\right)+1\right)^2} d t \\
& =\int_\theta^0 \frac{\alpha^2}{\left(\cos ^2 t\left(\alpha^2-1\right)+1\right)^2} d\left(\cos ^2 t\right) \\
& =\frac{\alpha^2}{\alpha^2-1} \int_0^\theta d \frac{1}{\cos ^2 t\left(\alpha^2-1\right)+1} \\
& =\frac{\alpha^2}{\alpha^2-1}\left(\frac{1}{\cos ^2 \theta\left(\alpha^2-1\right)+1}-\frac{1}{\alpha^2}\right) \\
& =\frac{\alpha^2}{\cos ^2 \theta\left(\alpha^2-1\right)^2+\left(\alpha^2-1\right)}-\frac{1}{\alpha^2-1} \\
& = \epsilon 
\end{aligned}
$$

The inverse of above equation is:
$$
\epsilon=\frac{\alpha^2}{\cos ^2 \theta\left(\alpha^2-1\right)^2+\left(\alpha^2-1\right)}-\frac{1}{\alpha^2-1}
$$

## Sampling Beckmann
[read hear](https://stephens999.github.io/fiveMinuteStats/inverse_transform_sampling.html)

## Sampling Blinn
[read hear](https://stephens999.github.io/fiveMinuteStats/inverse_transform_sampling.html)