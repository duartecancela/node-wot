# ☕ Projeto WoT com OAuth 2.0 — Máquina de Café Segura minimalista

Este projeto demonstra um sistema Web of Things (WoT) seguro, onde apenas consumidores autorizados podem aceder às propriedades e ações de uma _máquina de café_ via OAuth 2.0, usando o **fluxo client_credentials** e validação de **scopes**.

---

## 📦 Estrutura do Projeto

-   **`exposer-coffee.js`**: expõe uma Thing chamada `coffee-machine` com OAuth 2.0
-   **`consumer-coffee.js`**: consumidor que autentica, lê propriedades e invoca a ação `makeDrink`
-   **`server.js`**: servidor OAuth mock com introspecção
-   **`memory-model.js`**: modelo em memória que define clientes, scopes, tokens
-   **`wot-server-servient-conf.json` / `wot-client-servient-conf.json`**: configuram os bindings HTTP e as credenciais

---

## 🔐 Autenticação e Autorização com OAuth 2.0

A Thing `coffee-machine` está protegida com OAuth. Na Thing Description (TD), exige-se:

```json
"securityDefinitions": {
  "oauth2_sc": {
    "scheme": "oauth2",
    "flow": "client",
    "token": "https://localhost:3000/token",
    "scopes": ["coffee:access"]
  }
},
"security": ["oauth2_sc"]
```

Ou seja:

-   O consumidor deve obter um `access_token` do servidor OAuth
-   Esse token tem de incluir o scope `"coffee:access"`
-   A Thing valida esse token com um pedido `POST /introspect`

---

## ✅ Como executar o sistema

### Passo 1: Iniciar o servidor OAuth (mock)

```bash
npm run server
```

> Este servidor escuta em `https://localhost:3000` e fornece `/token` e `/introspect`

---

### Passo 2: Iniciar o exposer (máquina de café)

```bash
node ../../../packages/cli/dist/cli.js -f ./wot-server-servient-conf.json exposer-coffee.js
```

> Expõe a Thing `coffee-machine` em `https://localhost:8080/coffee-machine`
> Valida tokens OAuth via introspecção

---

### Passo 3: Iniciar o consumer

```bash
node ../../../packages/cli/dist/cli.js -f ./wot-client-servient-conf.json consumer-coffee.js
```

> O consumidor:

-   Lê as bebidas disponíveis (`possibleDrinks`)
-   Invoca a ação `makeDrink` com a bebida `"espresso"` (ou outra)
-   Só consegue interagir **se o token tiver o scope correto**

---

## 🧠 memory-model.js — Como funciona?

Este ficheiro define a base de dados OAuth **em memória**. Nele é definido o cliente autorizado:

```js
this.clients = [
    {
        clientId: "node-wot",
        clientSecret: "isgreat!",
        grants: ["client_credentials"],
        scopes: ["coffee:access"],
    },
];
```

E os tokens são guardados com `saveToken()` e validados com `getAccessToken()`.

---

## 🔄 O que acontece numa requisição

1. O `consumer` usa o clientId/clientSecret para obter um token em `/token`

2. O token é enviado à Thing no cabeçalho:

    ```
    Authorization: Bearer <token>
    ```

3. A Thing envia esse token para `/introspect`

4. O servidor OAuth verifica se:

    - O token está ativo (`active: true`)
    - O scope incluído é `"coffee:access"`

5. Se o scope estiver presente → acesso concedido
   Se não → erro `401 Unauthorized`

---

## 🔄 Como revogar a autorização?

Para **remover a autorização de acesso ao consumidor**, basta **retirar o scope `coffee:access`** do `memory-model.js`:

```js
this.clients = [
    {
        clientId: "node-wot",
        clientSecret: "isgreat!",
        grants: ["client_credentials"],
        scopes: ["user"], // ← acesso removido
    },
];
```

### Resultado:

-   O token é emitido com o scope errado
-   A Thing rejeita qualquer acesso
-   O `consumer` recebe:

    ```
    Access denied or error: Error: Client error: Unauthorized
    ```

---

## ✅ Como restaurar o acesso?

Basta repor:

```js
scopes: ["coffee:access"];
```

E reiniciar o servidor OAuth:

```bash
npm run server
```

---

## 🔍 Estado interno visível nos logs

Após cada pedido à ação `makeDrink`, o exposer imprime:

```
Parsed drink: espresso
📦 Estado atual:
- availableResourceLevel: 4
- maintenanceNeeded: false
- possibleDrinks: espresso, cappuccino, latte
```

---

## ✅ Testado com:

-   Node.js 18+
-   `@node-wot/core`
-   Binding HTTP com TLS (`allowSelfSigned: true`)
-   OAuth 2.0 client_credentials
-   Scope-based access control
