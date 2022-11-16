class User {
    constructor(name, gender, birth, country, email, password, file, admin) {
        this._id;
        this._name = name;//Encapsulamento - underline significa que ele e uma propriedade privada.Segue uma convenção para respeitar o conceito mas não necessariamente o deixa privado de fato
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._file = file;
        this._admin = admin;
        this._register = new Date();
    }

    get id() {
        return this._id;
    }
    get register() {
        return this._register;
    }

    get name() {
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get birth() {
        return this._birth;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get file() {
        return this._file;
    }
    set file(value) {
        this._file = value;
    }
    get admin() {
        return this._admin;
    }

    loadFromJSON(json) {
        for (let name in json) {

            switch (name) {
                case '_register':
                    this[name] = new Date(json[name])
                    break;
                default:
                    this[name] = json[name];

            }
        }
    }
    static getUsersStorage() {
        let users = [];
        if (localStorage.getItem("users")) {
            users = JSON.parse(localStorage.getItem("users"))
        }
        return users;
    }

    getNewID() {

        let usersID = parseInt(localStorage.getItem("userID"))
        if (!usersID > 0) {
            usersID = 0;
        }
        usersID++;
        localStorage.setItem("usersID", usersID);
        return usersID;
    }

    save() {
        let users = User.getUsersStorage();
        if (this.id > 0) {
            users.map(u => {
                if (u._id == this.id) {
                    Object.assign(u, this);
                }
                return u;
            });
        } else {
            this._id = this.getNewID();
            users.push(this);

        }
        localStorage.setItem("users", JSON.stringify(users));

    }

    remove() {
        let users = User.getUsersStorage();
        users.forEach((userData, index) => {
            if (this._id == userData._id) {
                users.splice(index, 1);
            }
        });
        localStorage.setItem("users", JSON.stringify(users));
    }

}
