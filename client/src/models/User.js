class User {
  constructor() {
    this.users = [
      {
        address: "0x5fEDb99AAe7F1880A7a97b0cbe070231a6678f07",
        pk: "0x54ebbbba420fa577d9a7be4e831d3ea540bcd9e455d83ade27956b52f28f1f52"
      },
      {
        address: "0x3c511616bA2F6bD8Aa4e1e9Cdc20389dC6B6b107",
        pk: "0x8f4149e18266e094b93069475de230f6a6f74fb2c9ecf044130aeaf90d400bb5"
      },
      {
        address: "0x5fe2ef48cb0c519b495a68d99d3705cafb0757ff",
        pk: "0xfbc8e1cb44f9505d93a6ae6215beed81a7be1eb9c6ce6e46fd520d747d9c84cb"
      },
      {
        address: "0x85Be6c1f4DE7a2D1de9564086394700ccb7d0852",
        pk: "0xfbc8e1cb44f9505d93a6ae6215beed81a7be1eb9c6ce6e46fd520d747d9c84cb"
      }
    ];
  }

  getUsers() {
    return this.users;
  }

  getUser(address) {
    const result = this.users.find(user => user.address === address);
    return result;
  }
}

module.exports = User;

// constructor(name, email, password, address) {
//   this.name = name;
//   this.email = email;
//   this.password = password;
//   this.address = address;
// }
//
// toString() {
//   return `${this.name} | ${this.email}g P :: ${this.address}g `;
// }
//
// print() {
//   console.log(this.toString());
// }
