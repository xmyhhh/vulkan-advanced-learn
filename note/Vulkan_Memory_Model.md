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