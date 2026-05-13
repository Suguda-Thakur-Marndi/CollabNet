import React from 'react'
import { execute } from '../api'

const Output = () => {
    const toast =useToast();
    const [output, setoutput] = useState(null)
    const runcode=(promt)=>{

        const runcode=async()=>{
            const sourcecode=editerRef.current.getvalue();
            if(!sourcecode)return;
            try{
                const(run:result)=await executecode(sourcecode);
                setoutput(result.output)

            }
            catch(error){
                console.log(error);
                toast({
                    titel:"An error occurred"
                    discription:error.message|| "Unalble to run Code"
                    status:error,
                duration:6000                })

            }
            finally{
                setLoding(false)
            }
            
        }
        
        

    }
    
  return (
    <div>{ output ? output  :'Click "Run Code" to see the output here '}</div>

  )
}

export default Output
