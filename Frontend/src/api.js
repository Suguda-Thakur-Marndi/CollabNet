import axios from 'axios'
const API = axios.create({
    baseURL: "https://emkc.org/api/v2/piston"
})

export const execute = async (sourceCode) => {
    const response = await API.post("/execute", {
        "language": "js",
        "version": "15.10.0",
        "files": [
            {
                "name": "my_cool_code.js",
                "content": sourceCode
            }
        ],
        "stdin": "",
        "args": ["1", "2", "3"],
        "compile_timeout": 10000,
        "run_timeout": 3000,
        "compile_memory_limit": -1,
        "run_memory_limit": -1
    })
    return response.data
}
