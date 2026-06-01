import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  template: `
  <div style="padding:20px;max-width:900px;margin:auto">
    <h2>Users</h2>
    <button (click)="logout()">Logout</button>
    <table>
      <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
      <tbody>
        <tr *ngFor="let u of users">
          <td>{{u.id}}</td>
          <td>{{u.name}}</td>
          <td>{{u.email}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class UsersComponent implements OnInit{
  users: any[] = [];
  constructor(private api: ApiService, private auth: AuthService, private router: Router){}
  async ngOnInit(){
    this.users = await this.api.get('user/login') as any[];
  }
  logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
