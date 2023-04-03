import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
      // Add your custom authentication logic here
      // for example, call super.logIn(request) to establish a session.
      return super.canActivate(context);
    }
  
    handleRequest(err, user, info) {
      // You can throw an exception based on either "info" or "err" arguments      
      if (err || !user) {        
        if(info){
          if(info.message === "jwt expired") throw new UnauthorizedException("La sesión expiro, inicie sesión nuevamente");
          if(info.message === "invalid token") throw new UnauthorizedException("Sesión no valida");
        }
        throw err || new UnauthorizedException();
      }
      return user;
    }
  }