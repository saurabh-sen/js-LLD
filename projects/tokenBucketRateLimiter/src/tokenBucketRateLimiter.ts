interface ITokenBucket {
  tokens: number[];
  lastRefilTimestamp: number;
}

export class TokenBucketRateLimiter {
  // data structure to store tokens per clients
  private rateLimiter: Map<string, ITokenBucket> = new Map();
  private capactiy: number = 0;
  private refilRate: number = 0;
  // refilRate is token per sec 5token/sec
  constructor(cap: number, rate: number = 5) {
    this.rateLimiter = new Map<string, ITokenBucket>();
    this.capactiy = cap;
    this.refilRate = rate;
  }

  allowRequest(clientId: string) {
    let clientBucket = this.rateLimiter.get(clientId);
    if (!clientBucket) {
      this.addNewClient(clientId);
      clientBucket = this.rateLimiter.get(clientId);
    }
    if (clientBucket!.tokens.length <= 0) {
      if (!this.refillBucket(clientId, clientBucket!)) {
        return false;
      }
      clientBucket = this.rateLimiter.get(clientId);
      this.decrementToken(clientId, clientBucket!);
      // throw 429 trying to refilling before refilRate
      // console.log("too many request 429");
    } else {
      this.decrementToken(clientId, clientBucket!);
    }
    return true;
  }

  private decrementToken(clientId: string, bucket: ITokenBucket) {
    const tokens = bucket.tokens;
    tokens.pop();
    this.rateLimiter.set(clientId, {
      tokens,
      lastRefilTimestamp: bucket.lastRefilTimestamp,
    });
  }

  private refillBucket(clientId: string, bucket: ITokenBucket) {
    const now = Date.now();

    const elapsedSeconds = (now - bucket.lastRefilTimestamp) / 1000;

    const generatedTokens = Math.floor(this.refilRate * elapsedSeconds);

    if (generatedTokens <= 0) {
      return false;
    }

    const currentTokens = bucket.tokens.length;

    const totalTokens = Math.min(
      this.capactiy,
      currentTokens + generatedTokens,
    );

    const newTokens = this.simulateTokenGeneration(totalTokens);

    this.rateLimiter.set(clientId, {
      tokens: newTokens,
      lastRefilTimestamp: now,
    });

    return true;
  }

  private addNewClient(clientId: string) {
    this.rateLimiter.set(clientId, {
      tokens: this.simulateTokenGeneration(this.capactiy),
      lastRefilTimestamp: Date.now(),
    });
  }

  private simulateTokenGeneration(nOfTokens: number) {
    const tokens: number[] = [];
    for (let i = 0; i < nOfTokens; ++i) {
      tokens.push(Math.floor(1000 + Math.random() * 9000));
    }
    return tokens;
  }
}
