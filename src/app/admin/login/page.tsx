"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function Login() {
  const [state, action, pending] = useActionState(login, {} as { error?: string });
  return (
    <div className="grid min-h-screen place-items-center bg-sunken p-5">
      <form action={action} className="card w-full max-w-sm space-y-4 p-8">
        <h1 className="t-h2">Вход в админку</h1>
        <div className="field"><label htmlFor="email">Почта</label><input id="email" name="email" type="email" className="input" required autoComplete="username" /></div>
        <div className="field"><label htmlFor="password">Пароль</label><input id="password" name="password" type="password" className="input" required autoComplete="current-password" /></div>
        {state.error && <p className="text-sm text-[#c0321c]" role="alert">{state.error}</p>}
        <button className="btn btn-primary w-full" disabled={pending}>Войти</button>
      </form>
    </div>
  );
}
