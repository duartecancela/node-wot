# Smart Coffee Machine with MQTT Alerts ☕

Este projeto baseia-se na máquina de café inteligente do repositório [Eclipse Thingweb node-wot](https://github.com/eclipse-thingweb/node-wot), tendo sido estendido para emitir e detetar eventos via protocolo MQTT. O sistema permite simular a redução de níveis de água e notificar clientes sempre que o nível ficar abaixo de um limiar pré-definido.

## 🧩 Componentes do Projeto

-   **Produtor WoT (Thing)**: `smart-coffee-machine-mqtt.js`
    -   Expõe um _Thing_ WoT via HTTP
    -   Publica alertas MQTT no tópico `coffee-machine/alert/water` sempre que o nível de água fica inferior a 20%
-   **Consumidor MQTT (Client)**: `smart-coffee-consumer.js`
    -   Subscreve ao tópico MQTT
    -   Simula redução do nível de água por teclado ou aleatoriamente
    -   Apresenta notificações de alerta no terminal

---

## 🚀 Como correr o projeto

### 1. Pré-requisitos

-   Node.js instalado
-   Broker MQTT local (ex: Mosquitto)
-   Dependências instaladas:

```bash
npm install @node-wot/core @node-wot/binding-http mqtt
```

### 2. Iniciar o broker Mosquitto

**Windows (com instalação completa):**

```bash
mosquitto -v
```

**Linux (caso esteja instalado via apt):**

```bash
sudo service mosquitto start
```

---

### 3. Executar o produtor

```bash
node examples/scripts/smart-coffee-machine-mqtt.js
```

-   O produtor será exposto em: `http://localhost:8080/smart-coffee-machine`
-   O nível de água é reduzido via ação `decreaseWater`
-   Se `waterLevel < 20`, é publicado um alerta MQTT

---

### 4. Executar o consumidor

```bash
node examples/scripts/smart-coffee-consumer.js
```

-   Mostra um menu interativo para:
    -   Reduzir o nível manualmente
    -   Reduzir de forma aleatória
-   Publica e subscreve mensagens MQTT

---

## 🔁 Publicar e Subscrever via linha de comandos (CLI)

Caso se deseje testar os tópicos manualmente fora do sistema WoT, pode utilizar o cliente de consola `mosquitto_pub` e `mosquitto_sub`.

### ▶️ Publicar uma mensagem:

```bash
mosquitto_pub -h localhost -t coffee-machine/alert/water -m "Manual test: water too low"
```

### 📡 Subscrever a um tópico:

```bash
mosquitto_sub -h localhost -t coffee-machine/alert/water
```

Estas ferramentas permitem validar facilmente o sistema e monitorizar os alertas em tempo real.
