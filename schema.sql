create database bamazon_db;
use bamazon_db;
create table departments(
	id int primary key auto_increment not null,
    department_name varchar(50) not null,
    over_head_costs int(20) not null
);
insert into departments (department_name, over_head_costs)
values ("apparel", 5000),
		("electronics",7500),
		("food",4000),
        ("shoes",3600),
        ("snacks",3000);
        
create table products(
	item_id int primary key auto_increment not null,
    product_name varchar(20) not null,
    department_name varchar(20) not null,
    price int not null,
    stock_quantity int not null,
    product_sales int not null
);
insert into products(product_name, department_name, price, stock_quantity, product_sales)
values ("nikes","apparel",50,10,500),
		("jeans","apparel",60,10,500),
        ("glasses","apparel",80,6,80),
        ("sandwiches","food",5,200,30),
        ("ice cream","food",2,150,22),
        ("keyboard","electronics",200,3,0),
        ("t-shirts","apparel",30,25,60),
        ("adidas","shoes",20,15,60),
        ("monitors","electronics",20,30,0),
        ("polos","apparel",15,22,0);