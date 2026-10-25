import { createContext,} from "react";
import type {ReactNode} from "react"
import type { usertype } from "../types/userType";
import { useMe } from "../hook/useMe";

interface UserContextType {
  user: usertype|null;
  isPending: boolean
}

// יצירת ה-Context
export const UserContext = createContext<UserContextType | undefined>(undefined);

// יצירת ה-Provider
export function UserProvider({ children }: { children: ReactNode }) {
const {data,isPending}=useMe()
const user=data?.data??null
  return (
      <UserContext.Provider value={{user,isPending}}>
          {children}
      </UserContext.Provider>
  );
}