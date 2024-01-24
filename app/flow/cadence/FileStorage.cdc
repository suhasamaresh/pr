pub contract  FileStorage {
    pub var allids: [[String]]

    pub fun addid(id: [String]) {
        self.allids.append(id)
    }

    init() {
        self.allids = []
    }
}