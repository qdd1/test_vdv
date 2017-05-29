# Quan Dao Dong
import requests
import json
from unidecode import unidecode
from lxml import html

url = 'http://en.vedur.is/weather/stations/?t=1'
res = requests.get(url)
tree = html.fromstring(res.content)
table = tree.find('.//table')
trs = table.findall('.//tr')
results = {}
for tr in trs:
	tds = tr.findall('.//td')
	if 'class' not in tds[0].keys():
		continue
	if tds[0].get('class') != 'name':
		continue
	name = unidecode(unicode(tds[0].text))

	href = tds[3].find('a')
	# Sometime they don't put the station number on the url
	# So we follow the url to get detail information and take it
	if href is None:
		get_url = tds[6].find('a').get('href')
		if get_url is None:
			print "can't find href in <a> in " + name
		new_url = 'http://en.vedur.is' + get_url
		new_res = requests.get(new_url)
		new_tree = html.fromstring(new_res.content)
		new_table = new_tree.find('.//table')
		new_trs = new_table.findall('.//tr')
		new_tds = new_trs[2].findall('.//td')
		if new_tds[0].text == 'Station number':
			station_num = new_tds[1].text
		else:
			print "can't find href in <a> in " + name
	else:
		station_url = href.get('href')
		station_num = station_url[station_url.find('station=') + 8:]

	if name == '' or station_num == '':
		print "something totally went wrong"
		continue
	results[station_num] = name


with open('jsondata.json', 'w') as outfile:
	json.dump(results, outfile, indent = 4)
print 'finish'
