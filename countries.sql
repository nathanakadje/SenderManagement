--
-- PostgreSQL database dump
--

\restrict ke5HfsJHMxcWbO1woasihmTkH946vQnfHLxHNf5AJ8Bu6l84fhBRnvO6wBZDp5X

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: countries; Type: TABLE; Schema: public; Owner: nathan
--

CREATE TABLE public.countries (
    id integer NOT NULL,
    code character varying(5) NOT NULL,
    name character varying(100) NOT NULL,
    flag character varying(10) NOT NULL,
    operators text[] DEFAULT '{}'::text[]
);


ALTER TABLE public.countries OWNER TO nathan;

--
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: nathan
--

CREATE SEQUENCE public.countries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.countries_id_seq OWNER TO nathan;

--
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nathan
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.id;


--
-- Name: countries id; Type: DEFAULT; Schema: public; Owner: nathan
--

ALTER TABLE ONLY public.countries ALTER COLUMN id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: nathan
--

COPY public.countries (id, code, name, flag, operators) FROM stdin;
1	AF	Afghanistan	🇦🇫	{}
2	AX	Aland Islands	🇦🇽	{}
3	AL	Albania	🇦🇱	{}
5	AD	Andorra	🇦🇩	{}
7	AR	Argentina	🇦🇷	{}
8	AM	Armenia	🇦🇲	{}
9	AW	Aruba	🇦🇼	{}
10	AU	Australia	🇦🇺	{}
11	AT	Austria	🇦🇹	{}
12	AZ	Azerbaijan	🇦🇿	{}
13	BH	Bahrain	🇧🇭	{}
14	BD	Bangladesh	🇧🇩	{}
15	BY	Belarus	🇧🇾	{}
16	BE	Belgium	🇧🇪	{}
17	BZ	Belize	🇧🇿	{}
18	BT	Bhutan	🇧🇹	{}
19	BO	Bolivia	🇧🇴	{}
20	BA	Bosnia and Herzegovina	🇧🇦	{}
22	BR	Brazil	🇧🇷	{}
23	BN	Brunei Darussalam	🇧🇳	{}
24	BG	Bulgaria	🇧🇬	{}
27	KH	Cambodia	🇰🇭	{}
32	CL	Chile	🇨🇱	{}
33	CN	China	🇨🇳	{}
34	CO	Colombia	🇨🇴	{}
38	CK	Cook Islands	🇨🇰	{}
39	CR	Costa Rica	🇨🇷	{}
41	HR	Croatia	🇭🇷	{}
42	CU	Cuba	🇨🇺	{}
43	CW	Curacao	🇨🇼	{}
44	CY	Cyprus	🇨🇾	{}
45	CZ	Czech Republic	🇨🇿	{}
46	DK	Denmark	🇩🇰	{}
47	DG	Diego Garcia	🇩🇬	{}
49	EC	Ecuador	🇪🇨	{}
51	SV	El Salvador	🇸🇻	{}
54	EE	Estonia	🇪🇪	{}
56	FK	Falkland Islands (Malvinas)	🇫🇰	{}
57	FO	Faroe Islands	🇫🇴	{}
58	FJ	Fiji	🇫🇯	{}
59	FI	Finland	🇫🇮	{}
60	FR	France	🇫🇷	{}
61	GF	French Guiana	🇬🇫	{}
62	PF	French Polynesia	🇵🇫	{}
65	GE	Georgia	🇬🇪	{}
66	DE	Germany	🇩🇪	{}
68	GI	Gibraltar	🇬🇮	{}
69	GR	Greece	🇬🇷	{}
70	GL	Greenland	🇬🇱	{}
71	GP	Guadeloupe	🇬🇵	{}
72	GT	Guatemala	🇬🇹	{}
75	GY	Guyana	🇬🇾	{}
76	HT	Haiti	🇭🇹	{}
77	HN	Honduras	🇭🇳	{}
78	HK	Hong Kong	🇭🇰	{}
79	HU	Hungary	🇭🇺	{}
80	IS	Iceland	🇮🇸	{}
81	IN	India	🇮🇳	{}
82	ID	Indonesia	🇮🇩	{}
83	IR	Iran	🇮🇮	{}
84	IQ	Iraq	🇮🇶	{}
85	IE	Ireland	🇮🇪	{}
86	IL	Israel	🇮🇱	{}
87	IT	Italy	🇮🇹	{}
88	JP	Japan	🇯🇵	{}
89	JO	Jordan	🇯🇴	{}
91	KI	Kiribati	🇰🇮	{}
92	KR	Korea	🇰🇷	{}
93	KP	Korea DPR	🇰🇵	{}
94	XK	Kosovo	🇽🇰	{}
95	KW	Kuwait	🇰🇼	{}
96	KG	Kyrgyzstan	🇰🇬	{}
97	LA	Lao DPR	🇱🇦	{}
98	LV	Latvia	🇱🇻	{}
99	LB	Lebanon	🇱🇧	{}
103	LI	Liechtenstein	🇱🇮	{}
104	LT	Lithuania	🇱🇹	{}
105	LU	Luxembourg	🇱🇺	{}
106	MO	Macao	🇲🇴	{}
109	MY	Malaysia	🇲🇾	{}
110	MV	Maldives	🇲🇻	{}
112	MT	Malta	🇲🇹	{}
113	MH	Marshall Islands	🇲🇭	{}
114	MQ	Martinique	🇲🇶	{}
117	MX	Mexico	🇲🇽	{}
21	BW	Botswana	🇧🇼	{"Botswana Btc Mobile","Botswana Mascom","Botswana Orange"}
28	CM	Cameroon	🇨🇲	{"Cameroon Camtel","Cameroon Mtn","Cameroon Nextel","Cameroon Orange"}
29	CV	Cape Verde	🇨🇻	{"Cape Verde CVMovel","Cape Verde Unitel T+"}
31	TD	Chad	🇹🇩	{"Chad Airtel","Chad Moov Africa"}
40	CI	Cote d Ivoire	🇨🇮	{"CIV Moov","CIV Mtn","CIV Orange"}
48	DJ	Djibouti	🇩🇯	{"Djibouti Evatis"}
50	EG	Egypt	🇪🇬	{"Egypt Etisalat","Egypt Orange","Egypt TE","Egypt Vodafone"}
53	ER	Eritrea	🇪🇷	{"Eritrea EriTel"}
63	GA	Gabon	🇬🇦	{"Gabon Airtel","Gabon Libertis","Gabon Moov"}
67	GH	Ghana	🇬🇭	{"Ghana AirtelTigo","Ghana Expresso","Ghana Mtn","Ghana Glo","Ghana Vodafone"}
90	KE	Kenya	🇰🇪	{"Kenya Airtel","Kenya Safaricom","Kenya Telkom"}
100	LS	Lesotho	🇱🇸	{"Lesotho Econet","Lesotho Vodacom","Lesotho Telecom"}
102	LY	Libya	🇱🇾	{"Libya Al-Madar","Libya LTT","Libya Libyana"}
108	MW	Malawi	🇲🇼	{"Malawi Airtel","Malawi Telekom"}
116	MU	Mauritius	🇲🇺	{"Mauritius Cellplus","Mauritius Emtel","Mauritius MTML"}
36	CG	Congo	🇨🇬	{"Congo Airtel","Congo Azur","Congo Mtn"}
118	FM	Micronesia	🇫🇲	{}
119	MD	Moldova	🇲🇩	{}
120	MC	Monaco	🇲🇨	{}
121	MN	Mongolia	🇲🇳	{}
122	ME	Montenegro	🇲🇪	{}
125	MM	Myanmar	🇲🇲	{}
127	NR	Nauru	🇳🇷	{}
128	NP	Nepal	🇳🇵	{}
129	NL	Netherlands	🇳🇱	{}
130	NC	New Caledonia	🇳🇨	{}
131	NZ	New Zealand	🇳🇿	{}
132	NI	Nicaragua	🇳🇮	{}
135	NU	Niue	🇳🇺	{}
136	MK	North Macedonia	🇲🇰	{}
137	NO	Norway	🇳🇴	{}
138	OM	Oman	🇴🇲	{}
139	PK	Pakistan	🇵🇰	{}
140	PW	Palau	🇵🇼	{}
141	PS	Palestine State of	🇵🇸	{}
142	PA	Panama	🇵🇦	{}
143	PG	Papua New Guinea	🇵🇬	{}
144	PY	Paraguay	🇵🇾	{}
145	PE	Peru	🇵🇪	{}
146	PH	Philippines	🇵🇭	{}
147	PN	Pitcairn	🇵🇳	{}
148	PL	Poland	🇵🇱	{}
149	PT	Portugal	🇵🇹	{}
150	QA	Qatar	🇶🇦	{}
151	RE	Reunion	🇷🇪	{}
152	RO	Romania	🇷🇴	{}
153	RU	Russian Federation	🇷🇺	{}
155	SH	Saint Helena	🇸🇭	{}
156	PM	Saint Pierre and Miquelon	🇵🇲	{}
157	WS	Samoa	🇼🇸	{}
158	SM	San Marino	🇸🇲	{}
160	SA	Saudi Arabia	🇸🇦	{}
162	RS	Serbia	🇷🇸	{}
165	SG	Singapore	🇸🇬	{}
166	SK	Slovakia	🇸🇰	{}
167	SI	Slovenia	🇸🇮	{}
168	SB	Solomon Islands	🇸🇧	{}
172	ES	Spain	🇪🇸	{}
173	LK	Sri Lanka	🇱🇰	{}
175	SR	Suriname	🇸🇷	{}
177	SE	Sweden	🇸🇪	{}
178	CH	Switzerland	🇨🇭	{}
179	SY	Syrian Arab Republic	🇸🇾	{}
180	TW	Taiwan, China	🇹🇼	{}
181	TJ	Tajikistan	🇹🇯	{}
183	TH	Thailand	🇹🇭	{}
184	TL	Timor-Leste	🇹🇱	{}
186	TK	Tokelau	🇹🇰	{}
187	TO	Tonga	🇹🇴	{}
189	TR	Turkey	🇹🇷	{}
190	TM	Turkmenistan	🇹🇲	{}
191	TV	Tuvalu	🇹🇻	{}
193	UA	Ukraine	🇺🇦	{}
194	AE	United Arab Emirates	🇦🇪	{}
195	GB	United Kingdom	🇬🇧	{}
196	UY	Uruguay	🇺🇾	{}
197	UZ	Uzbekistan	🇺🇿	{}
198	VU	Vanuatu	🇻🇺	{}
199	VA	Vatican City State	🇻🇦	{}
200	VE	Venezuela	🇻🇪	{}
201	VN	Viet Nam	🇻🇳	{}
202	WF	Wallis and Futuna Islands	🇼🇫	{}
203	YE	Yemen	🇾🇪	{}
206	NA_AM	North America	🇺🇸	{}
4	DZ	Algeria	🇩🇿	{"Algeria Djezzy","Algeria Mobilis","Algeria Ooredoo"}
6	AO	Angola	🇦🇴	{"Angola Africell","Angola Movicel","Angola Unitel"}
25	BF	Burkina Faso	🇧🇫	{"Burkina Faso Moov","Burkina Faso Orange","Burkina Faso Telecel"}
26	BI	Burundi	🇧🇮	{"Burundi Econet Leo","Burundi Lacell","Burundi Lumitel","Burundi Onamob"}
30	CF	Central African Republic	🇨🇫	{"Central African Rep. Moov","Central African Rep. NationLink","Central African Rep. Orange","Central African Rep. Telecel"}
35	KM	Comoros	🇰🇲	{"Comores Telecom","Comores Telco"}
37	CD	Congo DR	🇨🇩	{"Congo DR Africell","Congo DR Airtel","Congo DR Orange","Congo DR Vodacom"}
52	GQ	Equatorial Guinea	🇬🇶	{"Equa. Guinea Hits-GE","Equa. Guinea Orange"}
176	SZ	Swaziland	🇸🇿	{"Eswatini SPTC","Eswatini Swazi Mobile","Eswatini Mtn"}
55	ET	Ethiopia	🇪🇹	{"Ethiopia Ethio Telecom","Ethiopia Safaricom"}
64	GM	Gambia	🇬🇲	{"Gambia Africell","Gambia Comium","Gambia Gamcel","Gambia QCell"}
123	MA	Morocco	🇲🇦	{"Morocco Inwi","Morocco Maroc Telecom","Morocco Orange"}
133	NE	Niger	🇳🇪	{"Niger Sahelcom","Niger Orange","Niger Airtel","Niger Moov Africa",Zamani}
154	RW	Rwanda	🇷🇼	{"Rwanda Airtel-Tigo","Rwanda Mtn"}
161	SN	Senegal	🇸🇳	{"Senegal Expresso","Senegal Free","Senegal Orange"}
170	ZA	South Africa	🇿🇦	{"South Africa CELL C","South Africa Mtn","South Africa Telkom","South Africa Vodacom"}
171	SS	South Sudan	🇸🇸	{"South Sudan Digitel","South Sudan Gemtel","South Sudan Mtn","South Sudan Vivacel","South Sudan Zain"}
185	TG	Togo	🇹🇬	{"Togo Moov","Togo Togocel"}
188	TN	Tunisia	🇹🇳	{"Tunisia Ooredoo","Tunisia Orange","Tunisia Telecom"}
204	ZM	Zambia	🇿🇲	{"Zambia Airtel","Zambia Beeline Telecoms","Zambia Mtn","Zambia Zamtel"}
208	BJ	Benin	🇧🇯	{"Benin Mtn","Benin Sbin","Benin Moov"}
74	GW	Guinea-Bissau	🇬🇼	{"Guinea-Bissau Guinetel","Guinea-Bissau Orange","Guinea-Bissau Spacetel"}
73	GN	Guinea	🇬🇳	{"Guinea Mtn","Guinea Cellcom","Guinea Intercel","Guinea Orange","Guinea SotelGui"}
101	LR	Liberia	🇱🇷	{"Liberia LTC Mobile","Liberia Mtn","Liberia Orange"}
107	MG	Madagascar	🇲🇬	{"Madagascar Airtel","Madagascar Bip","Madagascar Orange","Madagascar Telma"}
111	ML	Mali	🇲🇱	{"Mali Orange","Mali Malitel","Mali Telecel"}
115	MR	Mauritania	🇲🇷	{"Mauritania Chinguitel","Mauritania Mattel","Mauritania Mauritel"}
124	MZ	Mozambique	🇲🇿	{"Mozambique Mcell","Mozambique Movitel","Mozambique Vodacom"}
126	NA	Namibia	🇳🇦	{"Namibia MTC","Namibia Mtn","Namibia Telecom","Namibia TN Mobile"}
134	NG	Nigeria	🇳🇬	{"Nigeria Airtel","Nigeria 9Mobile","Nigeria Glo","Nigeria Mtn"}
159	ST	Sao Tome and Principe	🇸🇹	{"Sao Tome and Principe CSTmovel","Sao Tome and Principe Unitel"}
163	SC	Seychelles	🇸🇨	{"Seychelles Airtel","Seychelles CWS","Seychelles Intelvision"}
164	SL	Sierra Leone	🇸🇱	{"Sierra Leone Africell","Sierra Leone Orange","Sierra Leone Qcell","Sierra Leone Sierratel"}
169	SO	Somalia	🇸🇴	{"Somalia AirSom","Somalia Amtel","Somalia Golis Telecom","Somalia Hormuud","Somalia Nationlink","Somalia SomLink","Somalia SomNet","Somalia Somtel","Somalia STG","Somalia Telesom"}
174	SD	Sudan	🇸🇩	{"Sudan Mtn","Sudan Vivacel","Sudan Zain"}
182	TZ	Tanzania	🇹🇿	{"Tanzania Airtel","Tanzania Smart","Tanzania Smile","Tanzania TTCL Mobile","Tanzania Tigo","Tanzania Viettel","Tanzania Vodacom","Tanzania Zantel"}
192	UG	Uganda	🇺🇬	{"Uganda Airtel","Uganda Hamilton Telecom","Uganda Mtn","Uganda Smile","Uganda Lycamobile","Uganda UTL"}
205	ZW	Zimbabwe	🇿🇼	{"Zimbabwe Econet","Zimbabwe NetOne","Zimbabwe Telecel"}
207	LB	Liban	🇱🇧	{Liban}
\.


--
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nathan
--

SELECT pg_catalog.setval('public.countries_id_seq', 208, true);


--
-- Name: countries countries_name_key; Type: CONSTRAINT; Schema: public; Owner: nathan
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_name_key UNIQUE (name);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: nathan
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict ke5HfsJHMxcWbO1woasihmTkH946vQnfHLxHNf5AJ8Bu6l84fhBRnvO6wBZDp5X

