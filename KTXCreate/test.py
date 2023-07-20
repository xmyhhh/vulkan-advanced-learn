import numpy as np
inPos= np.array([-7.4925, 0.01714, -7.6500, 1.0]).reshape(4,1)
model = np.diag([1,1,1,1])
lightSpaceMatrix =  np.array([
    [0.053, 0.00, -0.0848, 0.00],
    [0.06168, 0.06862, 0.03855, 9.53674E-08],
    [-0.00613, 0.00766, -0.00383, 0.71304],
    [0.00, 0.00, 0.00, 1.00],
])

biasMat =  np.array( [
	[0.5, 0.0, 0.0, 0.0],
	[0.0, 0.5, 0.0, 0.0],
	[0.0, 0.0, 1.0, 0.0],
	[0.5, 0.5, 0.0, 1.0]
])
biasMat = np.transpose(biasMat)
outShadowCoord = biasMat @ lightSpaceMatrix @ model  @ inPos
pass