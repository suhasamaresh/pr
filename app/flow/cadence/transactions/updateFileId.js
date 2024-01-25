export const updateids = `
import FileStorage from 0xf8d6e0586b0a20c7

transaction(id: [String]) {

  prepare(acct: AuthAccount) {
    
  }

  execute {
    FileStorage.addid(id: id)
   }
}
`