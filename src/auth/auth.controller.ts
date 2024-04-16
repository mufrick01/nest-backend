import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDTO, RegisterUserDto, UpdateUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginReponse } from './interfaces/login-response';
import { User } from './entities/user.entity';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin-create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  Login(@Body() loginDTO:LoginDTO){
    return this.authService.Login(loginDTO);
  }

  @Post('/register')
  Register(@Body() registerDto: RegisterUserDto){
    return this.authService.Register(registerDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req:Request) {
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('/check-token')
  async chektoken(@Request() req:Request):Promise<LoginReponse>{
    
    const user = await req['user'] as User;
    const{_id:id} = user

    return {
      user,
      token: this.authService.getJwtToken({id})
    }
  }


  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.authService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
