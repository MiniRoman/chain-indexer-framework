export interface IRawTransaction {
    hash: string;
    nonce: string;
    blockHash: string | null;
    blockNumber: string;
    transactionIndex?: string;
    from: string;
    to: string | null;
    value: string;
    gasPrice: string;
    gas: string;
    input: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
}
