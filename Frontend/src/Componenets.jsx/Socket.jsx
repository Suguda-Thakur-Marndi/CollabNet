import React, { useMemo } from 'react'
import { io } from 'socket.io-client'

const SocketContext = React.createContext(null)
export const useSocket = () => React.useContext(SocketContext)

export const SocketProvider = ({ children }) => {

    const socket = useMemo(() => io({
        host: 'localhost',
        port: 3000,
       
    }), [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketContext