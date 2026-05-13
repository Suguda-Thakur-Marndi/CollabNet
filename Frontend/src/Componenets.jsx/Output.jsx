import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { execute } from '../api'

const Output = ({ editerRef }) => {
    const toast = useToast();
    const [output, setOutput] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const runCode = (prompt) => {
        setIsLoading(true)
        const executeCode = async () => {
            const sourceCode = editerRef.current.getValue();
            if (!sourceCode) return;
            try {
                const { result } = await execute(sourceCode);
                setOutput(result.output)
                result.stderr ? setIsError(true) : setIsError(false)
            } catch (error) {
                console.log(error);
                toast({
                    title: "An error occurred",
                    description: error.message || "Unable to run Code",
                    status: "error",
                    duration: 6000
                })
            } finally {
                setIsLoading(false)
            }
        }
        executeCode()
    }
    
  return (
    <div>{ output ? output  :'Click "Run Code" to see the output here '}</div>

  )
}

export default Output
