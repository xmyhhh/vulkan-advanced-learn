<h1 align='center' >1. Prerequisite</h1>

### 1.1 Agent
- Operation is a general term for any task that is executed on the system.

- Each operation is executed by a particular **Agent**. Possible agents include each shader invocation, each host thread, and each fixed-function stage of the pipeline.

### 1.2 Memory Location
- A memory location identifies unique storage for 8 bits of data. Memory operations access a set of memory locations consisting of one or more memory locations at a time. (why 8 bits??)


### 1.3 Reference
 - A reference is an object that a particular agent can use to access a set of memory locations. 
 
 - On the host, a reference is a host virtual address. 
 
 - On the device, a reference is:

    - The descriptor that a variable is bound to, for variables in Image, Uniform, or StorageBuffer storage classes. If the variable is an array (or array of arrays, etc.) then each element of the array may be a unique reference.

    - The address range for a buffer in PhysicalStorageBuffer storage class, where the base of the address range is queried with vkGetBufferDeviceAddress and the length of the range is the size of the buffer.

    - A single common reference for all variables with Workgroup storage class that point to a block-decorated type.

    - The variable itself for non-block-decorated type variables in Workgroup storage class.

    - The variable itself for variables in other storage classes.

### 1.4 Memory Domains
The memory domains defined in Vulkan include:

- host - accessible by host agents

- device - accessible by all device agents for a particular device

- shader - accessible by shader agents for a particular device, corresponding to the Device scope

- queue family instance - accessible by shader agents in a single queue family, corresponding to the QueueFamily scope.

- fragment interlock instance - accessible by fragment shader agents that overlap, corresponding to the FragmentInterlock scope.

- shader call instance - accessible by shader agents that are shader-call-related, corresponding to the ShaderCallKHR scope.

- workgroup instance - accessible by shader agents in the same workgroup, corresponding to the Workgroup scope.

- subgroup instance - accessible by shader agents in the same subgroup, corresponding to the Subgroup scope.

### 1.5  Memory Types and Memory Heap
- There is always some DEVICE_LOCAL and some HOST_VISIBLE memory type
- A **memory heap** represents physical memory(video RAM on the graphics card or system RAM on the motherboard)
- A **memory type** belongs to certain heap and offers a “view” to that heap with certain properties
- **Memory type** is just a hint
    - **DEVICE_LOCAL** hint for us that resources created in it will probably work faster when accessed on the GPU.
    - **HOST_VISIBLE** 
        - means that you can call vkMapMemory on VkDeviceMemory objects allocated from this type and get a raw, CPU-side pointer to its data. 
        - you can access this memory directly from the CPU, without a need to launch a Vulkan command for explicit transfer, like vkCmdCopyBuffer.
    - **HOST_CACHED** 
        - can occur only on memory types that are also **HOST_VISIBLE**. 
        - It just informs us that access to this memory will go through cache (from CPU perspective, means cpu read/write on cache memory, cache memory can be flush to/valid by real memory, and gpu read/write dirctly on real memory). 
        - As a result, a memory type with this flag should be fast to write, read, and access randomly via mapped pointer.
        - Such memory may represent system RAM or even video RAM. 
        - We should only write to it sequentially (best to do memcpy), never read from it or jump over random places, as it may be slow.
    - **HOST_COHERENT**
        - means that writes/read to this memory on the CPU are made coherent automatically. 
        - Without this flag, you need to call vkFlushMappedMemoryRanges after writing and vkInvalidateMappedMemoryRanges before reading the memory via CPU pointer.
        - Note that mapping/unmapping memory doesn’t play a role here and is not even necessary – you can leave your memory persistently mapped while used on the GPU, as long as you ensure proper synchronization
        - HOST_VISIBLE but non-HOST_COHERENT memory types are a thing on mobile GPUs. Same with VK_MEMORY_PROPERTY_LAZILY_ALLOCATED_BIT – a  flag that can be found only on mobile chips currently and not on the PC.
- **Practice:**
    - **The Intel way**
        ```
            Heap 0: DEVICE_LOCAL
                Size = 1,849,059,532 B
                Type 0: DEVICE_LOCAL, HOST_VISIBLE, HOST_COHERENT
                Type 1: DEVICE_LOCAL, HOST_VISIBLE, HOST_COHERENT, HOST_CACHED
        ```
        **How to use it:** You can just load your resources directly from disk. There is no need to create a separate staging copy, separate GPU copy, and issue a transfer command, like we do with discrete graphics cards.
    - **The NVIDIA way**
        ```
        Heap 0: DEVICE_LOCAL
            Size = 8,421,113,856 B
            Type 0: DEVICE_LOCAL
            Type 1: DEVICE_LOCAL
        Heap 1
            Size = 8,534,777,856 B
            Type 0
            Type 1: HOST_VISIBLE, HOST_COHERENT
            Type 2: HOST_VISIBLE, HOST_COHERENT, HOST_CACHED
        
        ```
         NVIDIA likes to keep different types of resources (e.g. depth-stencil textures, render targets, buffers) in separate memory blocks, so it will just limit the types available for certain resources via VkMemoryRequirements::memoryTypeBits returned for a buffer or image.

         How to use it: We certainly need to create a staging copy of our resources in HOST_VISIBLE memory, at least temporarily, to load them from disk and then issue an explicit transfer using e.g. vkCmdCopyBuffer, vkCmdCopyBufferToImage to put them in another resource, created in DEVICE_LOCAL memory, that will be fast to access on the GPU.

         There might be a possibility for the GPU to access resources created in non-DEVICE_LOCAL memory directly. If it is possible, making **GPU reading/writing data straight from system RAM via PCI Express bus** will be slow, but may be beneficial over having two copies of the resource and issuing a transfer command in certain cases

    - **The AMD way**

        There is a possibility for CPU to address some video memory directly via normal void* pointer. This feature, known as Base Address Register (BAR)
        ```
        Heap 0: DEVICE_LOCAL
            Size = 8,304,721,920 B
            Type 0: DEVICE_LOCAL
        Heap 1
            Size = 16,865,296,384 B
            Type 0: HOST_VISIBLE, HOST_COHERENT
            Type 1: HOST_VISIBLE, HOST_COHERENT, HOST_CACHED
        Heap 2: DEVICE_LOCAL
            Size = 268,435,456 B
            Type 0: DEVICE_LOCAL, HOST_VISIBLE, HOST_COHERENT
        
        ```
        This list of memory heaps/types looks similar to the previous one, except now we have an additional, 3rd heap that has fixed size of only 256 MB. Most probably it is not a separate RAM chip, so things start getting “virtual” here (contrary to the promise of Vulkan API, which was supposed to be low level and closely represent modern GPU hardware…) 
        The lack of HOST_CACHED flag on this mem type indicates that it is not cached from CPU perspective, so it is better to only write to it sequentially.

        **How to use it:** This limited amount of 256 MB special memory can be used for resources that are written from CPU and read on GPU to avoid having two copies and issuing an explicit vkCmdCopy*, just like I described in point 1. It might be a good idea to put there resources that are changing every frame, like a ring buffer with uniforms (constants). Just remember that graphics driver may also use this special memory to optimize usage of some implicit Vulkan stuff (e.g. descriptors), so don’t use full 256 MB or even better – query for current budget.