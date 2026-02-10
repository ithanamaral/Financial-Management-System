class Profile {
    constructor(Userid, name, email) {
        this.id = Userid;
        this.name = name;
        this.email = email;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }

    getEmail() {
        return this.email;
    }

    setEmail(email) {
        this.email = email;
    }
}

module.exports = Profile;