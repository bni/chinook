--DROP TABLE customer;

--DROP TABLE employee;

CREATE TABLE customer (
  customer_id INT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT NOT NULL,
  support_rep_id INT
);

CREATE TABLE employee (
  employee_id INT PRIMARY KEY,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  title TEXT,
  reports_to INT,
  birth_date DATE,
  hire_date DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT
);

ALTER TABLE customer ADD CONSTRAINT customer_support_rep_id_fkey
  FOREIGN KEY (support_rep_id) REFERENCES employee (employee_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX customer_support_rep_id_idx ON customer (support_rep_id);

ALTER TABLE employee ADD CONSTRAINT employee_reports_to_fkey
  FOREIGN KEY (reports_to) REFERENCES employee (employee_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX employee_reports_to_idx ON employee (reports_to);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chinook;

INSERT INTO employee (employee_id, last_name, first_name, title, reports_to, birth_date, hire_date, address, city, state, country, postal_code, phone, fax, email) VALUES
    (1, N'Adams', N'Andrew', N'General Manager', NULL, '1962/2/18', '2002/8/14', N'11120 Jasper Ave NW', N'Edmonton', N'AB', N'Canada', N'T5K 2N1', N'+1 (780) 428-9482', N'+1 (780) 428-3457', N'andrew@chinookcorp.com'),
    (2, N'Edwards', N'Nancy', N'Sales Manager', 1, '1958/12/8', '2002/5/1', N'825 8 Ave SW', N'Calgary', N'AB', N'Canada', N'T2P 2T3', N'+1 (403) 262-3443', N'+1 (403) 262-3322', N'nancy@chinookcorp.com'),
    (3, N'Peacock', N'Jane', N'Sales Support Agent', 2, '1973/8/29', '2002/4/1', N'1111 6 Ave SW', N'Calgary', N'AB', N'Canada', N'T2P 5M5', N'+1 (403) 262-3443', N'+1 (403) 262-6712', N'jane@chinookcorp.com'),
    (4, N'Park', N'Margaret', N'Sales Support Agent', 2, '1947/9/19', '2003/5/3', N'683 10 Street SW', N'Calgary', N'AB', N'Canada', N'T2P 5G3', N'+1 (403) 263-4423', N'+1 (403) 263-4289', N'margaret@chinookcorp.com'),
    (5, N'Johnson', N'Steve', N'Sales Support Agent', 2, '1965/3/3', '2003/10/17', N'7727B 41 Ave', N'Calgary', N'AB', N'Canada', N'T3B 1Y7', N'1 (780) 836-9987', N'1 (780) 836-9543', N'steve@chinookcorp.com'),
    (6, N'Mitchell', N'Michael', N'IT Manager', 1, '1973/7/1', '2003/10/17', N'5827 Bowness Road NW', N'Calgary', N'AB', N'Canada', N'T3B 0C5', N'+1 (403) 246-9887', N'+1 (403) 246-9899', N'michael@chinookcorp.com'),
    (7, N'King', N'Robert', N'IT Staff', 6, '1970/5/29', '2004/1/2', N'590 Columbia Boulevard West', N'Lethbridge', N'AB', N'Canada', N'T1K 5N8', N'+1 (403) 456-9986', N'+1 (403) 456-8485', N'robert@chinookcorp.com'),
    (8, N'Callahan', N'Laura', N'IT Staff', 6, '1968/1/9', '2004/3/4', N'923 7 ST NW', N'Lethbridge', N'AB', N'Canada', N'T1H 1Y8', N'+1 (403) 467-3351', N'+1 (403) 467-8772', N'laura@chinookcorp.com');

INSERT INTO customer (customer_id, first_name, last_name, company, address, city, state, country, postal_code, phone, fax, email, support_rep_id) VALUES
    (1, N'Luís', N'Gonçalves', N'Embraer - Empresa Brasileira de Aeronáutica S.A.', N'Av. Brigadeiro Faria Lima, 2170', N'São José dos Campos', N'SP', N'Brazil', N'12227-000', N'+55 (12) 3923-5555', N'+55 (12) 3923-5566', N'luisg@embraer.com.br', 3),
    (2, N'Leonie', N'Köhler', NULL, N'Theodor-Heuss-Straße 34', N'Stuttgart', NULL, N'Germany', N'70174', N'+49 0711 2842222', NULL, N'leonekohler@surfeu.de', 5),
    (3, N'François', N'Tremblay', NULL, N'1498 rue Bélanger', N'Montréal', N'QC', N'Canada', N'H2G 1A7', N'+1 (514) 721-4711', NULL, N'ftremblay@gmail.com', 3),
    (4, N'Bjørn', N'Hansen', NULL, N'Ullevålsveien 14', N'Oslo', NULL, N'Norway', N'0171', N'+47 22 44 22 22', NULL, N'bjorn.hansen@yahoo.no', 4),
    (5, N'František', N'Wichterlová', N'JetBrains s.r.o.', N'Klanova 9/506', N'Prague', NULL, N'Czech Republic', N'14700', N'+420 2 4172 5555', N'+420 2 4172 5555', N'frantisekw@jetbrains.com', 4),
    (6, N'Helena', N'Holý', NULL, N'Rilská 3174/6', N'Prague', NULL, N'Czech Republic', N'14300', N'+420 2 4177 0449', NULL, N'hholy@gmail.com', 5),
    (7, N'Astrid', N'Gruber', NULL, N'Rotenturmstraße 4, 1010 Innere Stadt', N'Vienne', NULL, N'Austria', N'1010', N'+43 01 5134505', NULL, N'astrid.gruber@apple.at', 5),
    (8, N'Daan', N'Peeters', NULL, N'Grétrystraat 63', N'Brussels', NULL, N'Belgium', N'1000', N'+32 02 219 03 03', NULL, N'daan_peeters@apple.be', 4),
    (9, N'Kara', N'Nielsen', NULL, N'Sønder Boulevard 51', N'Copenhagen', NULL, N'Denmark', N'1720', N'+453 3331 9991', NULL, N'kara.nielsen@jubii.dk', 4),
    (10, N'Eduardo', N'Martins', N'Woodstock Discos', N'Rua Dr. Falcão Filho, 155', N'São Paulo', N'SP', N'Brazil', N'01007-010', N'+55 (11) 3033-5446', N'+55 (11) 3033-4564', N'eduardo@woodstock.com.br', 4),
    (11, N'Alexandre', N'Rocha', N'Banco do Brasil S.A.', N'Av. Paulista, 2022', N'São Paulo', N'SP', N'Brazil', N'01310-200', N'+55 (11) 3055-3278', N'+55 (11) 3055-8131', N'alero@uol.com.br', 5),
    (12, N'Roberto', N'Almeida', N'Riotur', N'Praça Pio X, 119', N'Rio de Janeiro', N'RJ', N'Brazil', N'20040-020', N'+55 (21) 2271-7000', N'+55 (21) 2271-7070', N'roberto.almeida@riotur.gov.br', 3),
    (13, N'Fernanda', N'Ramos', NULL, N'Qe 7 Bloco G', N'Brasília', N'DF', N'Brazil', N'71020-677', N'+55 (61) 3363-5547', N'+55 (61) 3363-7855', N'fernadaramos4@uol.com.br', 4),
    (14, N'Mark', N'Philips', N'Telus', N'8210 111 ST NW', N'Edmonton', N'AB', N'Canada', N'T6G 2C7', N'+1 (780) 434-4554', N'+1 (780) 434-5565', N'mphilips12@shaw.ca', 5),
    (15, N'Jennifer', N'Peterson', N'Rogers Canada', N'700 W Pender Street', N'Vancouver', N'BC', N'Canada', N'V6C 1G8', N'+1 (604) 688-2255', N'+1 (604) 688-8756', N'jenniferp@rogers.ca', 3),
    (16, N'Frank', N'Harris', N'Google Inc.', N'1600 Amphitheatre Parkway', N'Mountain View', N'CA', N'USA', N'94043-1351', N'+1 (650) 253-0000', N'+1 (650) 253-0000', N'fharris@google.com', 4),
    (17, N'Jack', N'Smith', N'Microsoft Corporation', N'1 Microsoft Way', N'Redmond', N'WA', N'USA', N'98052-8300', N'+1 (425) 882-8080', N'+1 (425) 882-8081', N'jacksmith@microsoft.com', 5),
    (18, N'Michelle', N'Brooks', NULL, N'627 Broadway', N'New York', N'NY', N'USA', N'10012-2612', N'+1 (212) 221-3546', N'+1 (212) 221-4679', N'michelleb@aol.com', 3),
    (19, N'Tim', N'Goyer', N'Apple Inc.', N'1 Infinite Loop', N'Cupertino', N'CA', N'USA', N'95014', N'+1 (408) 996-1010', N'+1 (408) 996-1011', N'tgoyer@apple.com', 3),
    (20, N'Dan', N'Miller', NULL, N'541 Del Medio Avenue', N'Mountain View', N'CA', N'USA', N'94040-111', N'+1 (650) 644-3358', NULL, N'dmiller@comcast.com', 4),
    (21, N'Kathy', N'Chase', NULL, N'801 W 4th Street', N'Reno', N'NV', N'USA', N'89503', N'+1 (775) 223-7665', NULL, N'kachase@hotmail.com', 5),
    (22, N'Heather', N'Leacock', NULL, N'120 S Orange Ave', N'Orlando', N'FL', N'USA', N'32801', N'+1 (407) 999-7788', NULL, N'hleacock@gmail.com', 4),
    (23, N'John', N'Gordon', NULL, N'69 Salem Street', N'Boston', N'MA', N'USA', N'2113', N'+1 (617) 522-1333', NULL, N'johngordon22@yahoo.com', 4),
    (24, N'Frank', N'Ralston', NULL, N'162 E Superior Street', N'Chicago', N'IL', N'USA', N'60611', N'+1 (312) 332-3232', NULL, N'fralston@gmail.com', 3),
    (25, N'Victor', N'Stevens', NULL, N'319 N. Frances Street', N'Madison', N'WI', N'USA', N'53703', N'+1 (608) 257-0597', NULL, N'vstevens@yahoo.com', 5),
    (26, N'Richard', N'Cunningham', NULL, N'2211 W Berry Street', N'Fort Worth', N'TX', N'USA', N'76110', N'+1 (817) 924-7272', NULL, N'ricunningham@hotmail.com', 4),
    (27, N'Patrick', N'Gray', NULL, N'1033 N Park Ave', N'Tucson', N'AZ', N'USA', N'85719', N'+1 (520) 622-4200', NULL, N'patrick.gray@aol.com', 4),
    (28, N'Julia', N'Barnett', NULL, N'302 S 700 E', N'Salt Lake City', N'UT', N'USA', N'84102', N'+1 (801) 531-7272', NULL, N'jubarnett@gmail.com', 5),
    (29, N'Robert', N'Brown', NULL, N'796 Dundas Street West', N'Toronto', N'ON', N'Canada', N'M6J 1V1', N'+1 (416) 363-8888', NULL, N'robbrown@shaw.ca', 3),
    (30, N'Edward', N'Francis', NULL, N'230 Elgin Street', N'Ottawa', N'ON', N'Canada', N'K2P 1L7', N'+1 (613) 234-3322', NULL, N'edfrancis@yachoo.ca', 3),
    (31, N'Martha', N'Silk', NULL, N'194A Chain Lake Drive', N'Halifax', N'NS', N'Canada', N'B3S 1C5', N'+1 (902) 450-0450', NULL, N'marthasilk@gmail.com', 5),
    (32, N'Aaron', N'Mitchell', NULL, N'696 Osborne Street', N'Winnipeg', N'MB', N'Canada', N'R3L 2B9', N'+1 (204) 452-6452', NULL, N'aaronmitchell@yahoo.ca', 4),
    (33, N'Ellie', N'Sullivan', NULL, N'5112 48 Street', N'Yellowknife', N'NT', N'Canada', N'X1A 1N6', N'+1 (867) 920-2233', NULL, N'ellie.sullivan@shaw.ca', 3),
    (34, N'João', N'Fernandes', NULL, N'Rua da Assunção 53', N'Lisbon', NULL, N'Portugal', NULL, N'+351 (213) 466-111', NULL, N'jfernandes@yahoo.pt', 4),
    (35, N'Madalena', N'Sampaio', NULL, N'Rua dos Campeões Europeus de Viena, 4350', N'Porto', NULL, N'Portugal', NULL, N'+351 (225) 022-448', NULL, N'masampaio@sapo.pt', 4),
    (36, N'Hannah', N'Schneider', NULL, N'Tauentzienstraße 8', N'Berlin', NULL, N'Germany', N'10789', N'+49 030 26550280', NULL, N'hannah.schneider@yahoo.de', 5),
    (37, N'Fynn', N'Zimmermann', NULL, N'Berger Straße 10', N'Frankfurt', NULL, N'Germany', N'60316', N'+49 069 40598889', NULL, N'fzimmermann@yahoo.de', 3),
    (38, N'Niklas', N'Schröder', NULL, N'Barbarossastraße 19', N'Berlin', NULL, N'Germany', N'10779', N'+49 030 2141444', NULL, N'nschroder@surfeu.de', 3),
    (39, N'Camille', N'Bernard', NULL, N'4, Rue Milton', N'Paris', NULL, N'France', N'75009', N'+33 01 49 70 65 65', NULL, N'camille.bernard@yahoo.fr', 4),
    (40, N'Dominique', N'Lefebvre', NULL, N'8, Rue Hanovre', N'Paris', NULL, N'France', N'75002', N'+33 01 47 42 71 71', NULL, N'dominiquelefebvre@gmail.com', 4),
    (41, N'Marc', N'Dubois', NULL, N'11, Place Bellecour', N'Lyon', NULL, N'France', N'69002', N'+33 04 78 30 30 30', NULL, N'marc.dubois@hotmail.com', 5),
    (42, N'Wyatt', N'Girard', NULL, N'9, Place Louis Barthou', N'Bordeaux', NULL, N'France', N'33000', N'+33 05 56 96 96 96', NULL, N'wyatt.girard@yahoo.fr', 3),
    (43, N'Isabelle', N'Mercier', NULL, N'68, Rue Jouvence', N'Dijon', NULL, N'France', N'21000', N'+33 03 80 73 66 99', NULL, N'isabelle_mercier@apple.fr', 3),
    (44, N'Terhi', N'Hämäläinen', NULL, N'Porthaninkatu 9', N'Helsinki', NULL, N'Finland', N'00530', N'+358 09 870 2000', NULL, N'terhi.hamalainen@apple.fi', 3),
    (45, N'Ladislav', N'Kovács', NULL, N'Erzsébet krt. 58.', N'Budapest', NULL, N'Hungary', N'H-1073', NULL, NULL, N'ladislav_kovacs@apple.hu', 3),
    (46, N'Hugh', N'O''Reilly', NULL, N'3 Chatham Street', N'Dublin', N'Dublin', N'Ireland', NULL, N'+353 01 6792424', NULL, N'hughoreilly@apple.ie', 3),
    (47, N'Lucas', N'Mancini', NULL, N'Via Degli Scipioni, 43', N'Rome', N'RM', N'Italy', N'00192', N'+39 06 39733434', NULL, N'lucas.mancini@yahoo.it', 5),
    (48, N'Johannes', N'Van der Berg', NULL, N'Lijnbaansgracht 120bg', N'Amsterdam', N'VV', N'Netherlands', N'1016', N'+31 020 6223130', NULL, N'johavanderberg@yahoo.nl', 5),
    (49, N'Stanisław', N'Wójcik', NULL, N'Ordynacka 10', N'Warsaw', NULL, N'Poland', N'00-358', N'+48 22 828 37 39', NULL, N'stanisław.wójcik@wp.pl', 4),
    (50, N'Enrique', N'Muñoz', NULL, N'C/ San Bernardo 85', N'Madrid', NULL, N'Spain', N'28015', N'+34 914 454 454', NULL, N'enrique_munoz@yahoo.es', 5),
    (51, N'Joakim', N'Johansson', NULL, N'Celsiusg. 9', N'Stockholm', NULL, N'Sweden', N'11230', N'+46 08-651 52 52', NULL, N'joakim.johansson@yahoo.se', 5),
    (52, N'Emma', N'Jones', NULL, N'202 Hoxton Street', N'London', NULL, N'United Kingdom', N'N1 5LH', N'+44 020 7707 0707', NULL, N'emma_jones@hotmail.com', 3),
    (53, N'Phil', N'Hughes', NULL, N'113 Lupus St', N'London', NULL, N'United Kingdom', N'SW1V 3EN', N'+44 020 7976 5722', NULL, N'phil.hughes@gmail.com', 3),
    (54, N'Steve', N'Murray', NULL, N'110 Raeburn Pl', N'Edinburgh ', NULL, N'United Kingdom', N'EH4 1HH', N'+44 0131 315 3300', NULL, N'steve.murray@yahoo.uk', 5),
    (55, N'Mark', N'Taylor', NULL, N'421 Bourke Street', N'Sidney', N'NSW', N'Australia', N'2010', N'+61 (02) 9332 3633', NULL, N'mark.taylor@yahoo.au', 4),
    (56, N'Diego', N'Gutiérrez', NULL, N'307 Macacha Güemes', N'Buenos Aires', NULL, N'Argentina', N'1106', N'+54 (0)11 4311 4333', NULL, N'diego.gutierrez@yahoo.ar', 4),
    (57, N'Luis', N'Rojas', NULL, N'Calle Lira, 198', N'Santiago', NULL, N'Chile', NULL, N'+56 (0)2 635 4444', NULL, N'luisrojas@yahoo.cl', 5),
    (58, N'Manoj', N'Pareek', NULL, N'12,Community Centre', N'Delhi', NULL, N'India', N'110017', N'+91 0124 39883988', NULL, N'manoj.pareek@rediff.com', 3),
    (59, N'Puja', N'Srivastava', NULL, N'3,Raj Bhavan Road', N'Bangalore', NULL, N'India', N'560001', N'+91 080 22289999', NULL, N'puja_srivastava@yahoo.in', 3);
