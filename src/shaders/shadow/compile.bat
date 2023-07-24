mkdir compile
C:/VulkanSDK/1.3.246.1/Bin/glslc.exe ./object.vert -g -o compile/object_vert.spv
C:/VulkanSDK/1.3.246.1/Bin/glslc.exe  ./object.frag -g -o compile/object_frag.spv

C:/VulkanSDK/1.3.246.1/Bin/glslc.exe  ./object_pcss.frag -g -o compile/object_pcss_frag.spv
C:/VulkanSDK/1.3.246.1/Bin/glslc.exe  ./object_pcss2.frag -g -o compile/object_pcss2_frag.spv

C:/VulkanSDK/1.3.246.1/Bin/glslc.exe  ./quad.vert -g -o compile/quad_vert.spv
C:/VulkanSDK/1.3.246.1/Bin/glslc.exe  ./quad.frag -g -o compile/quad_frag.spv

C:/VulkanSDK/1.3.246.1/Bin/glslc.exe  ./shadowmap.vert -g -o compile/shadowmap_vert.spv
