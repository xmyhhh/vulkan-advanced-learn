
cmake_minimum_required(VERSION 3.8.0)
project(mathExp)

set(EXAMPLES
	Low_Discrepancy_Sequence
)


function(buildExample EXAMPLE_NAME)
	SET(MAIN_CPP ./${EXAMPLE_NAME}.cpp)
	add_executable(${EXAMPLE_NAME} ${MAIN_CPP})	
endfunction(buildExample)

function(buildExamples)
	foreach(EXAMPLE ${EXAMPLES})
		buildExample(${EXAMPLE})
	endforeach(EXAMPLE)
endfunction(buildExamples)


buildExamples()