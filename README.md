# MySQL -> Kafka -> Elasticsearch Sync (via Debezium)

This project is a full pipeline that captures **real-time changes** from a MySQL table (`table_x`) using **Debezium**, streams changes to **Kafka**, and forwards them to **Elasticsearch** for search/indexing.

It uses **Docker Compose** to orchestrate all services.

---

## ✅ What This Solves

MySQL doesn't support real-time notifications natively. This setup solves:

* 🔁 **Change Data Capture**: Debezium reads MySQL binary logs
* 🧵 **Streaming Pipeline**: Kafka carries changes as events
* 🔍 **Realtime Search**: Elasticsearch receives and indexes the changes automatically

Use cases include:

* Event-driven architecture
* Microservice communication
* Search indexing
* Real-time analytics

---

## 📦 Requirements

* Docker + Docker Compose
* Node.js v18+
* `curl`, `jq` (for optional tests)

---

## 🛠 Setup Instructions

### 1. Clone and install dependencies

```bash
git clone <this-repo>
cd mysql-elastic-sync
npm install
```

---

### 2. Environment Variables (`.env`)

```env
# MySQL
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=mysql-elastic-sync

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=mysql-elastic-sync.table_x
```

---

### 3. Docker Compose Setup

Ensure the project includes the following Docker services:

* `mysql`: MySQL 8
* `kafka`, `zookeeper`: For Kafka message streaming
* `kafka-connect`: Debezium Kafka Connect (for binlog streaming)
* `elasticsearch`: For real-time document indexing
* `app`: Node.js container to run listener and CLI

#### ✅ `mysql/my.cnf`

```ini
[mysqld]
server-id=1
log-bin=mysql-bin
binlog_format=ROW
binlog_row_image=FULL
gtid_mode=ON
enforce-gtid-consistency=ON
```

---

### 4. Build and Start

```bash
docker compose down -v  # proxides full cleanup
docker compose up --build -d
```

Wait \~10 seconds for services to initialize.

---

---

## 🔧 Commands please run them once u set up the project (important)

| Command                      | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `npm run create:table`       | Creates schema `table_x` in MySQL             |
| `npm run seed:table`         | Seeds initial data to `table_x`               |
| `npm run sync:bulk`          | sync to Elasticsearch as bulk                       |
| `npm run register:connector` | Registers Debezium MySQL source connector     |
| `npm run consume`            | Starts Kafka consumer → sync to Elasticsearch |

---

### 5. Verify MySQL Binlog

```bash
docker exec -it mysql-db mysql -uroot -psecret
```

```sql
SHOW MASTER STATUS;
```

✅ You should see a binlog file and position.

---

## 🔌 Register Debezium Connector

```bash
npm run register:connector
```

Check status:

```bash
curl http://localhost:8083/connectors/mysql-elastic-connector/status | jq
```

You should see:

```json
{
  "connector": { "state": "RUNNING" },
  "tasks": [{ "state": "RUNNING" }]
}
```

---

## 🔁 Start Kafka Consumer

```bash
npm run consume
```

The consumer script listens for events and syncs to Elasticsearch.

---

## 🚀 Test Insert

```bash
docker exec -it mysql-db mysql -uroot -psecret -e \
"INSERT INTO \`mysql-elastic-sync\`.table_x (name, description) VALUES ('From Debezium', 'Test entry');"
```

Check logs from `npm run consume`:

```
🔄 Indexed document id=10
```

---

## 🔍 Search in Elasticsearch

```bash
curl -X GET http://localhost:9200/table_x/_search?pretty
```

## 🔁 Reset Everything

```bash
docker compose down -v
```

---

## 🧠 Notes

* MySQL version used: `mysql:8`
* Kafka Connect: `debezium/connect:2.6`
* Elasticsearch: `8.14.0`
* Kafka must resolve as `kafka` internally
* Debezium must access MySQL via `mysql` container alias
* Topics are auto-created by Debezium

---

## 👤 Author

**Mahmoud H. Isreawe**
Senior Software Engineer
