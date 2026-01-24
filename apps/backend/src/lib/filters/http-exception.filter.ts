import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const responseBody = exception.getResponse();
      const error =
        typeof responseBody === 'object' && responseBody
          ? ((responseBody as { error?: string }).error ??
            HttpStatus[statusCode])
          : HttpStatus[statusCode];
      const message =
        typeof responseBody === 'object' && responseBody
          ? ((responseBody as { message?: string | string[] }).message ??
            responseBody)
          : responseBody;

      response.status(statusCode).send({
        statusCode,
        error,
        message,
      });
      return;
    }

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error ? exception.message : 'Unexpected error';

    response.status(statusCode).send({
      statusCode,
      error: HttpStatus[statusCode],
      message,
    });
  }
}
