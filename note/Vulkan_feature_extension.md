<h1 align='center' >1. Prerequisite</h1>

### 1.1 Extensions
- Extensions may define new Vulkan commands, structures, and enumerants.

#### 1.1.1 InstanceExtensions
- Instance extensions add new instance-level functionality to the API,outside of the core specification.
- To query the available instance extensions call **vkEnumerateInstanceExtensionProperties**
```c
// Provided by VK_VERSION_1_0
VkResult vkEnumerateInstanceExtensionProperties(
  const char* pLayerName,
  uint32_t* pPropertyCount,
  VkExtensionProperties* pProperties);
```

```c
typedef struct VkInstanceCreateInfo {
    VkStructureType             sType;
    const void*                 pNext;
    VkInstanceCreateFlags       flags;
    const VkApplicationInfo*    pApplicationInfo;
    uint32_t                    enabledLayerCount;
    const char* const*          ppEnabledLayerNames;
    uint32_t                    enabledExtensionCount;
    const char* const*          ppEnabledExtensionNames;
} VkInstanceCreateInfo;
```

#### 1.1.2 Device Extensions
- Device extensions add new device-level functionality to the API, outside of the core specification
- To query the extensions available to a given physical device, call **vkEnumerateDeviceExtensionProperties**
```c
// Provided by VK_VERSION_1_0
VkResult vkEnumerateDeviceExtensionProperties(
  VkPhysicalDevice physicalDevice,
  const char* pLayerName,
  uint32_t* pPropertyCount,
  VkExtensionProperties* pProperties);
```

```c
typedef struct VkDeviceCreateInfo {
    VkStructureType                    sType;
    const void*                        pNext;
    VkDeviceCreateFlags                flags;
    uint32_t                           queueCreateInfoCount;
    const VkDeviceQueueCreateInfo*     pQueueCreateInfos;
    uint32_t                           enabledLayerCount;
    const char* const*                 ppEnabledLayerNames;
    uint32_t                           enabledExtensionCount;
    const char* const*                 ppEnabledExtensionNames;
    const VkPhysicalDeviceFeatures*    pEnabledFeatures;
} VkDeviceCreateInfo;
```
#### 1.1.3 Extension Dependencies
- Some extensions are dependent on other extensions, or on specific core API versions, to function.

#### 1.1.4 [Difference between instance and device extensions?](https://stackoverflow.com/questions/53050182/vulkan-difference-between-instance-and-device-extensions)
- The Vulkan instance is the piece of code that is used to set up devices. It deals with things like enumerating VkPhysicalDevices and querying their properties, as well as the call to create VkDevices itself. and The Vulkan device is for dealing with Vulkan rendering systems.
- Device extensions pertain to the behavior of a particular VkDevice object which was created with that extension activated. As such, that extension cannot describe the behavior of stuff that happens before the device is created.






### 2.1 Feature
- Features describe functionality which is not supported on all implementations. Features are
properties of the physical device. Features are optional, and must be explicitly enabled before use.
- All features in Vulkan can be categorized/found in 3 sections
    - Core 1.0 Features: These are the set of features that were available from the initial 1.0 release of Vulkan. The list of features can be found in **VkPhysicalDeviceFeatures**
    - Future Core Version Features: With Vulkan 1.1+ some new features were added to the core version of Vulkan.  The list of features can be found in **VkPhysicalDeviceFeatures11** and **VkPhysicalDeviceFeatures12**
    - Extension Features: Sometimes extensions contain features in order to enable certain aspects of the extension. These are easily found as they are all labeled as **VkPhysicalDevice[ExtensionName]Features**
```c
typedef struct VkPhysicalDeviceFeatures {
    VkBool32    robustBufferAccess;
    VkBool32    fullDrawIndexUint32;
    VkBool32    imageCubeArray;
    VkBool32    independentBlend;
    VkBool32    geometryShader;
    VkBool32    tessellationShader;
    VkBool32    sampleRateShading;
   //…………………………
    VkBool32    sparseResidency8Samples;
    VkBool32    sparseResidency16Samples;
    VkBool32    sparseResidencyAliased;
    VkBool32    variableMultisampleRate;
    VkBool32    inheritedQueries;
} VkPhysicalDeviceFeatures;
```
```c
typedef struct VkPhysicalDeviceRayTracingPipelineFeaturesKHR {
    VkStructureType    sType;
    void*              pNext;
    VkBool32           rayTracingPipeline;
    VkBool32           rayTracingPipelineShaderGroupHandleCaptureReplay;
    VkBool32           rayTracingPipelineShaderGroupHandleCaptureReplayMixed;
    VkBool32           rayTracingPipelineTraceRaysIndirect;
    VkBool32           rayTraversalPrimitiveCulling;
} VkPhysicalDeviceRayTracingPipelineFeaturesKHR;

typedef struct VkPhysicalDeviceRayTracingPipelinePropertiesKHR {
    VkStructureType    sType;
    void*              pNext;
    uint32_t           shaderGroupHandleSize;
    uint32_t           maxRayRecursionDepth;
    uint32_t           maxShaderGroupStride;
    uint32_t           shaderGroupBaseAlignment;
    uint32_t           shaderGroupHandleCaptureReplaySize;
    uint32_t           maxRayDispatchInvocationCount;
    uint32_t           shaderGroupHandleAlignment;
    uint32_t           maxRayHitAttributeSize;
} VkPhysicalDeviceRayTracingPipelinePropertiesKHR;

 // Requesting ray tracing properties
 //In particular, it will obtain the maximum recursion depth, i.e. the number of nested ray tracing calls that can be performed from a single ray. This can be seen as the number of times a ray can bounce in the scene in a recursive path tracer. Note that for performance purposes, recursion should in practice be kept to a minimum, favoring a loop formulation. This also queries the shader header size, needed in a later section for creating the shader binding table.
  VkPhysicalDeviceRayTracingPipelinePropertiesKHR m_rtPropertie{VK_STRUCTURE_TYPE_PHYSICAL_DEVICE_RAY_TRACING_PIPELINE_PROPERTIES_KHR};
  VkPhysicalDeviceProperties2 prop2{VK_STRUCTURE_TYPE_PHYSICAL_DEVICE_PROPERTIES_2};
  prop2.pNext = &m_rtProperties;
  vkGetPhysicalDeviceProperties2(m_physicalDevice, &prop2);
```
- When new features are added in future Vulkan versions or extensions, each
 extension should introduce one new feature structure
- For convenience, new core versions of Vulkan may introduce new unified feature structures for
features promoted from extensions. At the same time, the extension’s original feature structure (if any) is also promoted to the core API, and is an alias of the extension’s structure. (**VkPhysicalDevice[ExtensionName]FeaturesKHR**???)
- Features describe functionality which is not supported on all implementations. Features can be queried and then enabled when creating the VkDevice. Besides the list of all features, some features are mandatory due to newer Vulkan versions or use of extensions.
    - A common technique is for an extension to expose a new struct that can be passed through pNext that adds more features to be queried.

#### 2.1.1 [How to Enable the Features](https://github.com/KhronosGroup/Vulkan-Guide/blob/main/chapters/enabling_features.adoc#enabling-features)
- All features must be enabled at **VkDevice** creation time inside the **VkDeviceCreateInfo** struct.
- For the Core 1.0 Features:
```c
VkPhysicalDeviceFeatures features = {};
vkGetPhysicalDeviceFeatures(physical_device, &features);

// Logic if feature is not supported
if (features.robustBufferAccess == VK_FALSE) {
}

VkDeviceCreateInfo info = {};
info.pEnabledFeatures = &features;
```

- For all features, including the Core 1.0 Features, use **VkPhysicalDeviceFeatures2** to pass into **VkDeviceCreateInfo.pNext**. The same works for the “Future Core Version Features” too.
```c
VkPhysicalDeviceShaderDrawParametersFeatures ext_feature = {};

VkPhysicalDeviceFeatures2 physical_features2 = {};
physical_features2.pNext = &ext_feature;

vkGetPhysicalDeviceFeatures2(physical_device, &physical_features2);

//query support, Logic if feature is not supported
if (ext_feature.shaderDrawParameters == VK_FALSE) {
}

// Vulkan >= 1.1 uses pNext to enable features, and not pEnabledFeatures
VkDeviceCreateInfo info = {};
info.pNext = &physical_features2;
```
