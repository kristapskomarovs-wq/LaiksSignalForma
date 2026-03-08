import { signal, WritableSignal } from "@angular/core";
import { required, SchemaPathTree, validate, validateHttp } from "@angular/forms/signals";

//Data access object; Data transfer object; Model; Interface


export interface UserLoginModel {
    id?: number;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface UserDataShopModel{
    id: number;
    email: string;
}

export function createUserLoginForm(): WritableSignal<UserLoginModel> {
    return signal<UserLoginModel>({
        
        email: '',
        password: '',
        confirmPassword: ''
    });
}

export function validateUserLoginForm(s: SchemaPathTree<UserLoginModel>) {
    required(s.email, { message: 'Email is required' });
    required(s.password, { message: 'Password is required' });
    required(s.confirmPassword, { message: 'Confirm Password is required' });
    validate(s.confirmPassword, ({value, valueOf})=>{
        const pass = valueOf(s.password);
        const confirmPass = value();
            if(pass !== confirmPass) {
            return {
                kind: 'passwordMismatch',
                message: 'Passwords do not match'
            };
            
        }
        return null;
    });

   
}
