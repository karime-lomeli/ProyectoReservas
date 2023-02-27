import { Component, OnInit, inject, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { Sala } from 'src/app/models/sala.model';
import { Reserva } from 'src/app/models/reservas.model';
import swal from'sweetalert2';
import { interval, timer } from 'rxjs';



@Component({
  selector: 'app-sala',
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css']
})

export class SalaComponent implements OnInit {
  tituloAlerta:string='';
  idMostrar=0;
  nombreMostrar='';
  capacidadMostrar=0;
  statusMostrar='';
  editar!:BsModalRef;
  agregar!:BsModalRef;
  eliminar!:BsModalRef;
  reservar!:BsModalRef;
  mostrarReserva!:BsModalRef;
  
  http = inject(HttpClient);
  salas: Sala[]=[];
  reservas!: Reserva[];
  reservasAux!:any;
  reservasOcurriendo!:Reserva[];
  salaaux!:Sala[];
  mensaje:string='';

  

  
  constructor(private modalService: BsModalService){
   

  }

 formularioEditar(id:number,nombre:string,capacidad:number,status:string, template:TemplateRef<any>){
  this.changeId(id,nombre,capacidad,status);
  this.editar = this.modalService.show(template);
 }

 formularioAgregar(template:TemplateRef<any>){
  this.agregar = this.modalService.show(template);
 }
 formularioReservar(id:number,template:TemplateRef<any>){
  this.idMostrar=id;
  this.reservar = this.modalService.show(template);
 }
 formulariomosRes(idSala:number,template:TemplateRef<any>){
  this.http.get<Reserva[]>('http://localhost:4000/api/salas/ob/res/ervas/'+idSala)
  .subscribe((data)=>{
      this.reservasAux= data; });
      this.mostrarReserva=this.modalService.show(template);
 }
 formularioEliminar(id:number){
  swal.fire({
    title: 'En verdad quieres eliminar la sala?',
    showDenyButton: true,
    confirmButtonText: 'Si',
    denyButtonText: 'No',
    customClass: {
      actions: 'my-actions',
      confirmButton: 'order-2',
      denyButton: 'order-3',
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.delete<any>('http://localhost:4000/api/salas/'+id)
      .subscribe(data => this.salas = data.id);
      this.recargar();
      swal.fire('La sala ha sido eliminada', '', 'success')
    } else if (result.isDenied) {
      swal.fire('No se guardaron los cambios', '', 'info')
    }
  })
  
 }
 changeId(id:number,nombre:string,capacidad:number,status:string){
  this.idMostrar=id;
  this.nombreMostrar=nombre;
  this.capacidadMostrar=capacidad;
  this.statusMostrar=status;
 }

 

 addReserva(idSala:string,nombreUs:string,fechaI:string,fechaF:string){
  var idS=Number(idSala);
  var body = { fechaInicio:fechaI,
    fechaSalida:fechaF,
    idSala:idS
  }
  this.http.post<Reserva[]>('http://localhost:4000/api/salas/va/li/da',body)
  .subscribe(data=>{
      this.reservasAux= data;
      if(this.reservasAux.length==0){
        
        var splitted = fechaI.split('');
        var horaInicial:Number=Number(splitted[0]+splitted[1]);
        var minutoInicial:Number=Number(splitted[3]+splitted[4]);
        var split = fechaF.split('');
        var horaFinal:Number=Number(split[0]+split[1]);
        var minutoFinal:number=Number(split[3]+split[4]);
        var diferenciaHoras:Number = Number(horaFinal)- Number(horaInicial);
      
        if(diferenciaHoras==0 || diferenciaHoras==2 && minutoFinal<=minutoInicial || diferenciaHoras==1){
            var bodyx = { idSala:idS,
              nombreUsuario:nombreUs,
              fechaInicio:fechaI,
              fechaSalida:fechaF,
            ocurriendo:0  };
              this.http.post<string>('http://localhost:4000/api/salas/reserva',bodyx)
                .subscribe(data=>this.mensaje=data);
                alert("Se ha registrado tu reserva");
                swal.fire('Se ha registrado tu reserva','','success');
          
        }else{
          swal.fire("No estás dentro del rango de tiempo permitido",'','error');
        }
      }else{
        alert("La sala se encuentra ocupada en ese rango de tiempo");
        
      }


    });
  
 }
 


 update(idC:string,nombreC:string,capacidadC:string,statusC:string)
  {
    var ida= Number(idC);
    var cap=Number(capacidadC);
    const body = { nombre: nombreC,
                  capacidad: cap,
                  status: statusC };
    this.http.put<any>('http://localhost:4000/api/salas/'+ida, body)
        .subscribe(data => this.salas = data.id);
     swal.fire('Se han guardado los cambios','','success');
     this.recargar();
  } 

  addSala(nombreA:string,capacidad:string){
    var cap=Number(capacidad);
    const body = { nombre: nombreA,
      capacidad: cap,
      status: 'Disponible'};
      this.http.post<string>('http://localhost:4000/api/salas',body)
      .subscribe(data=>this.mensaje=data);
      swal.fire('Se ha registrado la sala','','success');
      this.recargar();
  }


  recargar(){
    this.http.get<Sala[]>('http://localhost:4000/api/salas')
    .subscribe((data)=>{
        this.salas= data;
    });
  }
  bloquearInicio(idReserva:number,idS:number){
    const body={
      idSala:idS
    };
    this.http.put<any>('http://localhost:4000/api/salas/bloquea/'+idReserva,body)
    .subscribe(data => this.salas = data.id);
    this.recargar();
  }
  desbloquearSala(idReserva:number,idS:number){
    const body={
      idSala:idS
    };
    this.http.put<any>('http://localhost:4000/api/salas/desbloquea/'+idReserva,body)
    .subscribe(data => this.salas = data.id);
    this.recargar();
  }

  ngOnInit(){
    this.http.get<Sala[]>('http://localhost:4000/api/salas')
    .subscribe((data)=>{
        this.salas= data;
    });

    const contador = interval(1000);
    contador.subscribe((n) => {
      let date : Date = new Date();
      console.log('Cada '+n+' minutos '+date.getHours()+":"+date.getMinutes());
      this.http.get<Reserva[]>('http://localhost:4000/api/salas/oc/up')
    .subscribe((data)=>{
        this.reservas= data; });

        this.http.get<Reserva[]>('http://localhost:4000/api/salas/oc/op')
    .subscribe((data)=>{
        this.reservasOcurriendo= data; });

        let fecha= date.getHours()+":";
        if(date.getHours()==1 || date.getHours()==2 || date.getHours()==3 || date.getHours()==4 || date.getHours()==5
          || date.getHours()==6 || date.getHours()==7 || date.getHours()==8 || date.getHours()==9){
            fecha= "0"+fecha;
          }
        let minutos;
        if(this.reservas){
          
          if(date.getMinutes()==0||date.getMinutes()==1||date.getMinutes()==2||date.getMinutes()==3||date.getMinutes()==4||date.getMinutes()==5
          ||date.getMinutes()==6||date.getMinutes()==7||date.getMinutes()==8||date.getMinutes()==9){
              minutos="0"+date.getMinutes();
          }else{
            minutos=date.getMinutes();
          }
          fecha=fecha+minutos+":00";
          for(let i in this.reservas){
              if(this.reservas[i].fechaInicio==fecha){
                this.bloquearInicio(this.reservas[i].idReserva,this.reservas[i].idSala);
              }
          }
          
        }
        if(this.reservasOcurriendo){
          console.log(fecha);
          
          for(let i in this.reservasOcurriendo){
console.log(this.reservasOcurriendo[i].fechaSalida);
              if(this.reservasOcurriendo[i].fechaSalida==fecha){
                this.desbloquearSala(this.reservasOcurriendo[i].idReserva,this.reservasOcurriendo[i].idSala);
              }
          }
        }
    
    });
  }
  


}