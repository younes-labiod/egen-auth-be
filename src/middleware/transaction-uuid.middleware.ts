import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { RequestContext } from "src/utils/request-context";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TransactionUuidMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TransactionUuidMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const transactionUuid =
      (req.headers["transaction-uuid"] as string) || uuidv4();
    req.headers["transaction-uuid"] = transactionUuid;

    RequestContext.setTransactionUuid(transactionUuid);

    this.logger.log(
      `Transaction UUID: ${transactionUuid} | Receing new Request: ${req.method} ${req.originalUrl}
      Headers: ${JSON.stringify(req.headers)} 
      Body: ${JSON.stringify(req.body)} `
    ); // TODO think about securing or deleting PII from logs.

    next();
  }
}
