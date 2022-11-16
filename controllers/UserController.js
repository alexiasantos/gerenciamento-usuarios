class UserController {
    constructor(formIdCreate, formIdUpdate, tableId) {//serve para qualquer formulário
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate();
        })
        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true;
            let values = this.getValues(this.formUpdateEl);

            console.log(values);
            let index = this.formUpdateEl.dataset.trindex
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);//todos objetos que estao a direita sobrescrevem os da esquerda

            this.getFile(this.formUpdateEl).then(
                (content) => {
                    if (!values.file) {

                        result._file = userOld._file;
                    } else {
                        result._file = content;
                    }

                    tr.dataset.user = JSON.stringify(result);

                    tr.innerHTML = ` <tr>
            <td><img src="${result._file}" alt="User Image" class="img-circle img-sm"></td>
            <td>${result._name}</td>
            <td>${result._email}</td>
            <td>${(result._admin) ? 'sim' : 'Não'}</td>
            <td>${(result._register).toLocaleDateString()}</td>
            <td>
              <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
              <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
          </tr>`;

                    this.addEventsTr(tr);
                    this.updateCount();
                    this.formUpdateEl.reset();
                    this.showPanelCreate();
                    btn.disabled = false;//botão é reativado, quando o carregamento foi fnalizado 

                }, (e) => {
                    console.error(e);
                });
        });

    }

    onSubmit() {
        this.formEl.addEventListener("submit", event => {
            event.preventDefault();// cancelando o comportamento padrao do formulário
            let btn = this.formEl.querySelector("[type=submit]");
            btn.disabled = true;//antes da finalização do carregamento o botão está desativado
            let values = this.getValues(this.formEl);
            if (!values) {
                return false;
            }
            this.getFile(this.formEl).then(
                (content) => {
                    values.file = content;

                    this.insert(values);
                    this.addLine(values);
                    this.formEl.reset(); //limpar o formulario quando o botão submit e clicado
                    btn.disabled = false;//botão é reativado, quando o carregamento foi fnalizado 
                }, (e) => {
                    console.error(e);
                });

        });
    }//onSubmit


    getFile(formulario) {
        // promessa é uma classe então precisa ser instanciado. E importante ter cuidado com os conflitos de contextos,sempre bom usar arrow function no lugar da function
        return new Promise((resolve, reject) => {// quando der certo executo o resolve, quando der errado executo o reject
            let fileReader = new FileReader();//API para ler imagens
            let elements = [...formulario.elements].filter(item => { // ... spread (propagação)

                if (item.name === 'file') {
                    return item;
                }
            });
            let file = elements[0].files[0];
            fileReader.onload = () => {

                resolve(fileReader.result);
            };
            fileReader.onerror = (e) => {
                reject(e);
            }
            if (file) {

                fileReader.readAsDataURL(file) // caso exista conteudo de imagem escolhido pelo usuário

            } else {

                resolve("dist/img/uni.jpg");//caso não coloquem nenhuma imagem ou nao cliquem em nenhum genero uma imagem cinza irá aparecer na foto
            }
        });
    };//getFile

    getValues(formulario) {
        let user = {};
        let isValid = true;
        [...formulario.elements].forEach(function (field, index) {//... é o spread para percorrer todos os índices. Transformei em array usando o []
            //transformando para uma estrutura que ele conseguisse entender (tava dando erro "não é uma função")
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }


            if (field.name === "gender") {

                if (field.checked) {
                    user[field.name] = field.value
                }

            } else if (field.name == "admin") {
                user[field.name] = field.checked;//enviar info se ele esta checked ou nao e não somente on por padrão
            } else {

                user[field.name] = field.value

            }

        });
        if (!isValid) {
            return false;
        }
        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.file,
            user.admin
        );


    }//getValues

    getUsersStorage() {
        let users = [];
        if (localStorage.getItem("users")) {
            users = JSON.parse(localStorage.getItem("users"))
        }
        return users;
    }

    selectAll() {
        let users = this.getUsersStorage();
        users.forEach(dataUser => {
            let user = new User();
            user.loadFromJSON(dataUser);
            this.addLine(user);
        });

    }

    insert(data) {
        let users = this.getUsersStorage();
        users.push(data);
        localStorage.setItem("users", JSON.stringify(users));
    }//insert 

    addLine(dataUser) {
        // utilizando a crase, nos temos o template String
        let tr = document.createElement('tr');
        //dataset utilizado para leitura de elementos, permite colocar atributos em qualquer tipo de elemento inclusive os HTML com data-* e depois uma posterior recuperação em JSon

        tr.dataset.user = JSON.stringify(dataUser);// JASON utilizado para deserializar o objeto e transformar em string
        tr.innerHTML = ` <tr>
        <td><img src="${dataUser.file}" alt="User Image" class="img-circle img-sm"></td>
        <td>${dataUser.name}</td>
        <td>${dataUser.email}</td>
        <td>${(dataUser.admin) ? 'sim' : 'Não'}</td>
        <td>${(dataUser.register).toLocaleDateString()}</td>
        <td>
          <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
          <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
        </td>
      </tr>`;

        this.addEventsTr(tr);
        this.tableEl.appendChild(tr);//criando elementos na list que aparece na view
        this.updateCount();

    }//addLine

    addEventsTr(tr) {

        tr.querySelector(".btn-delete").addEventListener("click", e => {
            if (confirm("Deseja realmente excluir")) {
                tr.remove();
                this.updateCount();
            }
        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {
            let json = JSON.parse(tr.dataset.user);
            this.formUpdateEl.dataset.trindex = tr.sectionRowIndex;
            for (let name in json) {
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {
                    console.log(field);
                    switch (field.type) {
                        case 'file':

                            continue;
                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            console.log(field);
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                    }
                    field.value = json[name];
                }
            }

            this.formUpdateEl.querySelector(".foto").src = json._file;
            this.showPanelUpdate();
        });


    }//event

    showPanelCreate() {
        document.querySelector("#box-user-create").style.display = "block"
        document.querySelector("#box-user-update").style.display = "none"
    }
    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none"
        document.querySelector("#box-user-update").style.display = "block"
    }

    updateCount() {
        let numberUsers = 0;
        let numberAdmin = 0;
        [... this.tableEl.children].forEach(tr => {
            numberUsers++;
            let user = JSON.parse(tr.dataset.user);
            if (user._admin) numberAdmin++;//Foi utilizado o underline, porque senao ele chamaria o admin la do get no arq Users então chamamos direto do JSON 
        });
        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }

}