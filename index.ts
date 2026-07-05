// NexFlux Transaction Orchestration Engine
// Multi-node message routing and staged execution simulation

// ---------------- CORE DATA STRUCTURES ----------------

type Transaction = {
    id: number;
    payload: string;
    strength: number;
    hop: number;
};

type RouteResult = {
    transaction: Transaction;
    accepted: boolean;
};

// ---------------- NODE IMPLEMENTATION ----------------

class Node {
    private name: string;
    private liquidity: number;

    constructor(name: string, liquidity: number) {
        this.name = name;
        this.liquidity = liquidity;
    }

    process(tx: Transaction): Transaction | null {
        // Liquidity affects processing capability
        const threshold = tx.strength + tx.hop;

        if (this.liquidity >= threshold) {
            return {
                ...tx,
                payload: `[${this.name}] ${tx.payload}`,
                hop: tx.hop + 1
            };
        }

        return null;
    }

    getName(): string {
        return this.name;
    }
}

// ---------------- NETWORK ROUTER ----------------

class Network {
    private nodes: Node[];

    constructor(nodes: Node[]) {
        this.nodes = nodes;
    }

    route(tx: Transaction): Transaction {
        let current = tx;

        // Sequential node traversal (non-linear transformation chain)
        for (const node of this.nodes) {
            const result = node.process(current);

            if (result) {
                current = result;
            } else {
                // If node rejects, skip transformation but continue network flow
                current = {
                    ...current,
                    payload: `[SKIPPED:${node.getName()}] ` + current.payload
                };
            }
        }

        return current;
    }
}

// ---------------- TRANSACTION ENGINE ----------------

class TransactionEngine {
    private network: Network;

    constructor(network: Network) {
        this.network = network;
    }

    execute(tx: Transaction): RouteResult {
        const finalState = this.network.route(tx);

        // Acceptance rule based on hop progression and payload complexity
        const accepted = finalState.hop > 1 && finalState.payload.length > 10;

        return {
            transaction: finalState,
            accepted
        };
    }
}

// ---------------- SYSTEM INITIALIZATION ----------------

// Create network nodes with varying liquidity capacity
const nodes = [
    new Node("Node-A", 5),
    new Node("Node-B", 8),
    new Node("Node-C", 3),
    new Node("Node-D", 10)
];

// Build network topology
const network = new Network(nodes);

// Create engine
const engine = new TransactionEngine(network);

// Sample transaction stream
const stream: Transaction[] = [
    { id: 1, payload: "init payment flow", strength: 4, hop: 0 },
    { id: 2, payload: "sync ledger update", strength: 6, hop: 0 },
    { id: 3, payload: "final settlement batch", strength: 7, hop: 0 }
];

// Execute system
for (const tx of stream) {
    const result = engine.execute(tx);

    console.log(
        `TX ${result.transaction.id} => ` +
        (result.accepted ? "CONFIRMED" : "DECLINED")
    );
}

// Debug final state output
console.log("\n--- FINAL NETWORK OUTPUT ---");
console.log(JSON.stringify(stream, null, 2));
