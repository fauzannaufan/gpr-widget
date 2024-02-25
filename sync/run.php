<?php

error_reporting(0);

echo "Processing...\n";

require '../vendor/autoload.php';

use GuzzleHttp\Client;

// Variabel Set

$source = [
	'artikel' => [
		'link' => 'https://www.kominfo.go.id/content/rss/artikel_gpr',
		'icon_class' => 'gpr-kominfo-widget-icon-berita-pemerintahan',
		'category_title' => 'Artikel GPR'
	],
	'infografis' => [
		'link' => 'https://www.kominfo.go.id/content/rss/infografis',
		'icon_class' => 'gpr-kominfo-widget-icon-infografis',
		'category_title' => 'Infografis'
	],
	'rilis_media_gpr' => [
		'link' => 'https://www.kominfo.go.id/content/rss/rilis_media_gpr',
		'icon_class' => 'gpr-kominfo-widget-icon-rilis-media-gpr',
		'category_title' => 'Rilis Media GPR'
	]
];

$path_generator = [
	['path'=>'../public/build/data/covid-19/','filename'=>'gpr-all.xml'],
	['path'=>'../public/build/data/covid-19/','filename'=>'gpr.xml'],
	['path'=>'../public/src/data/covid-19/','filename'=>'gpr-all.xml'],
	['path'=>'../public/src/data/covid-19/','filename'=>'gpr.xml']
];

$data = [
	'all'=>[],
	'new'=>[]
];

$exist_xml = '../public/build/data/covid-19/gpr.xml';
$generate_stat = 0;
$hash = '';

// Function Set

function formatDate($tgl){
	$hari = substr($tgl,0,3);
	$tanggal = substr($tgl,5,17);

	$day = [
		'Sun'=>'Minggu','Mon'=>'Senin','Tue'=>'Selasa','Wed'=>'Rabu',
		'Thu'=>'Kamis','Fri'=>'Jumat','Sat'=>'Sabtu'
	];

	$format_date = $day[$hari].', '.$tanggal;

	return $format_date;
}

function sortFunction($a, $b) {
    return strtotime($a["dateOrigin"]) - strtotime($b["dateOrigin"]);
}

echo "Pulling Data...\n";

// Create a client
$client = new Client();

// Pull and Set data from resources
foreach ($source as $key => $value) {
	$category = $key;
	$cek_data = $client->get($value['link']);
	$status = $cek_data->getStatusCode();
	if($status == 200){
		$data_xml = simplexml_load_file($value['link']);
		foreach ($data_xml->channel->item as $key2 => $value2) {
			
			$row = [
				'title'=>$value2->title,
				'category'=>$category,
				'dateOrigin'=>$value2->pubDate,
				'pubDate'=>substr($value2->pubDate,5,17),
				'author'=>' ',
				'link'=>$value2->link,
				'description'=>$value2->description,
				'icon_class'=>$value['icon_class'],
				'category_title'=>$value['category_title'],
				'flag' => $value2->flag
			];
			$data['all'][] = $row;
		}
	} else {
		echo "Error !";
	}
}



echo "Sorting Data...\n";

// Sorting process
usort($data['all'], "sortFunction");

$data['all'] = array_reverse($data['all']);
$no = 1;

// Set new content for display in widget
foreach ($data['all'] as $key => $value) {
	if($key < 10){
		$hash = $hash.$value['title'].$value['pubDate'].$value['category'].$value['link'];
		$data['new'][] = $value;
	}
}

$hash = md5($hash);

echo "Generate XML...\n";

//function defination to convert array to xml
function array_to_xml($array, &$xml_info) {
    foreach($array as $key => $value) {
        if(is_array($value)) {
            if(!is_numeric($key)){
                $subnode = $xml_info->addChild("$key");
                array_to_xml($value, $subnode);
            }else{
                $subnode = $xml_info->addChild("item");
                array_to_xml($value, $subnode);
            }
        }else {
            $xml_info->addChild("$key",htmlspecialchars("$value"));
        }
    }
}


echo "Checking XML exists...\n";

if(file_exists($exist_xml)){

	// Call exist xml file
	$xml_origin = simplexml_load_file($exist_xml);

	$hash_eksis = $xml_origin->hash;

	echo "Hash Eksis : ".$hash_eksis."\n";
	echo "Hash Generate : ".$hash."\n";

	// Check content value
	if($hash_eksis != $hash){
		
		foreach ($path_generator as $key => $value) {
			if($value['filename'] == 'gpr.xml'){
				// Creating object of SimpleXMLElement
				$xml_gpr = new SimpleXMLElement("<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version =\"2.0\"><hash>$hash</hash></rss>");
				array_to_xml($data['new'],$xml_gpr);
				$xml_file = $xml_gpr->asXML($value['path'].$value['filename']);
			} else {
				// Creating object of SimpleXMLElement
				$xml_gpr_all = new SimpleXMLElement("<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version =\"2.0\"><hash>$hash</hash></rss>");
				array_to_xml($data['all'],$xml_gpr_all);
				$xml_file = $xml_gpr_all->asXML($value['path'].$value['filename']);
			}
			$generate_stat++;
			
		}

		if($generate_stat > 0){
			echo "Status : XML File have been generated successfully\n";
		} else {
			echo "Status : XML File generated failed !\n";
		}

	} else {
		echo "Status : konten GPR is up to date\n";
	}

} else {

	mkdir("../public/build/data/covid-19",0775,true);

	foreach ($path_generator as $key => $value) {
		if($value['filename'] == 'gpr.xml'){
			// Creating object of SimpleXMLElement
			$xml_gpr = new SimpleXMLElement("<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version =\"2.0\"><hash>$hash</hash></rss>");
			array_to_xml($data['new'],$xml_gpr);
			$xml_file = $xml_gpr->asXML($value['path'].$value['filename']);
		} else {
			// Creating object of SimpleXMLElement
			$xml_gpr_all = new SimpleXMLElement("<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version =\"2.0\"><hash>$hash</hash></rss>");
			array_to_xml($data['all'],$xml_gpr_all);
			$xml_file = $xml_gpr_all->asXML($value['path'].$value['filename']);
		}
		$generate_stat++;	
	}

	if($generate_stat > 0){
		echo "Status : XML File have been generated successfully\n";
	} else {
		echo "Status : XML File generated failed tes !\n";
	}
}

echo "Finished...\n";

?>
