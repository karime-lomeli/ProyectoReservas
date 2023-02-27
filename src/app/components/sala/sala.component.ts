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
  idMostrar=0; //Auxiliares para mostrar contenido
  nombreMostrar='';
  capacidadMostrar=0;
  statusMostrar='';
  editar!:BsModalRef; //Auxiliar para modal de editar sala
  agregar!:BsModalRef; //Auxiliar para modal de agregar sala
  eliminar!:BsModalRef; //Auxiliar para modal de eliminar sala
  reservar!:BsModalRef; //Auxiliar para modal de reservar sala 
  mostrarReserva!:BsModalRef; //Auxiliar para modal donde se muestra la informacion de una reserva
  
  http = inject(HttpClient); //Para peticiones http a api
  salas: Sala[]=[]; //Vector de tipo del modelo de Sala
  reservas!: Reserva[]; //Vector de tipo del modelo de Reservas
  reservasAux!:any; //Auxiliar en una peticion http
  reservasOcurriendo!:Reserva[]; //Para almacenar las reservas que estan ocurriendo en este momento
  salaaux!:Sala[]; //Auxiliar en una peticion http
  mensaje:string=''; //Para almacenar respuestas de peticion http

  

  
  constructor(private modalService: BsModalService){
  }

  //Para mostrar el formulario de editar
  //Recibe parametros que a su vez manda a función para ser asignados
 formularioEditar(id:number,nombre:string,capacidad:number,status:string, template:TemplateRef<any>){
  this.changeId(id,nombre,capacidad,status);
  this.editar = this.modalService.show(template);
 }
 //Para mostrar el formulario de agregar una sala
 formularioAgregar(template:TemplateRef<any>){
  this.agregar = this.modalService.show(template);
 }
 //Para mostrar la formulario de agregar reserva
 formularioReservar(id:number,template:TemplateRef<any>){
  this.idMostrar=id;
  this.reservar = this.modalService.show(template);
 }
 //Muestra formulario con la información de una reserva en curso
 formulariomosRes(idSala:number,template:TemplateRef<any>){
  this.http.get<Reserva[]>('http://localhost:4000/api/salas/ob/res/ervas/'+idSala) //Hace peticion http para saber cual reserva de esa sala es la que esta ocurriendo en este momento 
  .subscribe((data)=>{
      this.reservasAux= data; }); //almacena en el vector auxiliar la respuesta del api
      this.mostrarReserva=this.modalService.show(template); //Muestra el modal con la informacion
 }
 //Pregunta al usuario si en verdad quiere eliminar un registro
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
    if (result.isConfirmed) { //Si el usuario confirma que quiere eliminar
      this.http.delete<any>('http://localhost:4000/api/salas/'+id) //Hace petición al api enviandole el id del elemento a eliminar
      .subscribe(data => this.salas = data.id);
      this.recargar();
      swal.fire('La sala ha sido eliminada', '', 'success')
    } else if (result.isDenied) {
      swal.fire('No se guardaron los cambios', '', 'info')
    }
  })
  
 }
 changeId(id:number,nombre:string,capacidad:number,status:string){ //Solo actualiza datos
  this.idMostrar=id;
  this.nombreMostrar=nombre;
  this.capacidadMostrar=capacidad;
  this.statusMostrar=status;
 }

 
//Registra una reserva 
 addReserva(idSala:string,nombreUs:string,fechaI:string,fechaF:string){
  var idS=Number(idSala); //Convierte a number un string
  var body = { fechaInicio:fechaI,
    fechaSalida:fechaF,
    idSala:idS
  }
  this.http.post<Reserva[]>('http://localhost:4000/api/salas/va/li/da',body) //Hace peticion para checar que no haya una reserva en el rango de tiempo de la nueva reserva
  .subscribe(data=>{
      this.reservasAux= data;
      if(this.reservasAux.length==0){ //Si no hay alguna reserva en el rango de tiempo
        
        var splitted = fechaI.split('');
        var horaInicial:Number=Number(splitted[0]+splitted[1]);
        var minutoInicial:Number=Number(splitted[3]+splitted[4]);
        var split = fechaF.split('');
        var horaFinal:Number=Number(split[0]+split[1]);
        var minutoFinal:number=Number(split[3]+split[4]);
        var diferenciaHoras:Number = Number(horaFinal)- Number(horaInicial);
      
        if(diferenciaHoras==0 || diferenciaHoras==2 && minutoFinal<=minutoInicial || diferenciaHoras==1){ //Comprueba que no se quiera hacer la reserva por más de dos horas
            var bodyx = { idSala:idS,
              nombreUsuario:nombreUs,
              fechaInicio:fechaI,
              fechaSalida:fechaF,
            ocurriendo:0  };
              this.http.post<string>('http://localhost:4000/api/salas/reserva',bodyx) //Peticion post, donde se registra la reserva
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
 


 update(idC:string,nombreC:string,capacidadC:string,statusC:string) //Actualizar una sala
  {
    var ida= Number(idC);
    var cap=Number(capacidadC);
    const body = { nombre: nombreC,
                  capacidad: cap,
                  status: statusC };
    this.http.put<any>('http://localhost:4000/api/salas/'+ida, body) //Peticion put al api para actualizar
        .subscribe(data => this.salas = data.id);
     swal.fire('Se han guardado los cambios','','success');
     this.recargar();
  } 

  addSala(nombreA:string,capacidad:string){ //Agregar una sala
    var cap=Number(capacidad);
    const body = { nombre: nombreA,
      capacidad: cap,
      status: 'Disponible'};
      this.http.post<string>('http://localhost:4000/api/salas',body) //Peticion post al api para agregar
      .subscribe(data=>this.mensaje=data);
      swal.fire('Se ha registrado la sala','','success');
      this.recargar();
  }

  recargar(){
    this.http.get<Sala[]>('http://localhost:4000/api/salas') //recarga la vista
    .subscribe((data)=>{
        this.salas= data;
    });
  }
  bloquearInicio(idReserva:number,idS:number){ //Bloquea la sala cuando se llega la hora de su inicio
    const body={
      idSala:idS
    };
    this.http.put<any>('http://localhost:4000/api/salas/bloquea/'+idReserva,body) //Manda peticion para actualizar el status de la sala
    .subscribe(data => this.salas = data.id);
    this.recargar();
  }
  desbloquearSala(idReserva:number,idS:number){ //Desbloquea la sala cuando el tiempo ha terminado o cuando el usuario lo solicita
    const body={
      idSala:idS
    };
    this.http.put<any>('http://localhost:4000/api/salas/desbloquea/'+idReserva,body)
    .subscribe(data => this.salas = data.id);
    this.recargar();
  }

  ngOnInit(){ //Al cargar
    this.http.get<Sala[]>('http://localhost:4000/api/salas') //Carga la vista
    .subscribe((data)=>{
        this.salas= data;
    });

    const contador = interval(1000); 
    contador.subscribe((n) => {
      let date : Date = new Date();
      this.http.get<Reserva[]>('http://localhost:4000/api/salas/oc/up') //Peticion para reservas que aun NO comienzan
    .subscribe((data)=>{
        this.reservas= data; });

        this.http.get<Reserva[]>('http://localhost:4000/api/salas/oc/op') //Peticion para reservas que YA comenzaron
    .subscribe((data)=>{
        this.reservasOcurriendo= data; });

        let fecha= date.getHours()+":"; //obtenemos la hora actual
        if(date.getHours()==1 || date.getHours()==2 || date.getHours()==3 || date.getHours()==4 || date.getHours()==5
          || date.getHours()==6 || date.getHours()==7 || date.getHours()==8 || date.getHours()==9){
            fecha= "0"+fecha;
          }
        let minutos;
        if(this.reservas){ //Si hay reservas que no han comenzado
          
          if(date.getMinutes()==0||date.getMinutes()==1||date.getMinutes()==2||date.getMinutes()==3||date.getMinutes()==4||date.getMinutes()==5
          ||date.getMinutes()==6||date.getMinutes()==7||date.getMinutes()==8||date.getMinutes()==9){
              minutos="0"+date.getMinutes();
          }else{
            minutos=date.getMinutes();
          }
          fecha=fecha+minutos+":00";
          for(let i in this.reservas){ //Recorremos el vector con las reservas que aun no comienzan
              if(this.reservas[i].fechaInicio==fecha){ //Si la hora de inicio de la reserva es igual a la hora actual
                this.bloquearInicio(this.reservas[i].idReserva,this.reservas[i].idSala); //Mandamos bloquear la sala
              }
          }
          
        }
        if(this.reservasOcurriendo){ //Si hay reservas que estan en curso
          
          for(let i in this.reservasOcurriendo){ //Recorremos el vector con las reservas que ya comenzaron
              if(this.reservasOcurriendo[i].fechaSalida==fecha){ //Si la hora final de la reserva es igual a la hora actual
                this.desbloquearSala(this.reservasOcurriendo[i].idReserva,this.reservasOcurriendo[i].idSala); //Manda desbloquear la sala
              }
          }
        }
    
    });
  }
  


}