class User {
  constructor(name, email, password, address) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.address = address;
  }

  toString() {
    return `${this.name} | ${this.email}g P :: ${this.address}g `;
  }

  print() {
    console.log(this.toString());
  }
}

module.exports = { User };
