import fs from 'fs';

async function main() {
    const p = JSON.parse(fs.readFileSync('src/lib/places.json', 'utf8'));
    const withPop = p.filter((x: any) => x.population !== undefined);
    const gte1000 = p.filter((x: any) => x.population >= 1000);
    const noPop = p.filter((x: any) => x.population === undefined);
    
    console.log({ 
        total: p.length, 
        withPop: withPop.length, 
        gte1000: gte1000.length, 
        noPop: noPop.length 
    });

    const noPopSample = noPop.slice(0, 10).map((x: any) => x.name);
    console.log("Steekproef zonder populatiedata:", noPopSample);
    
    const beProvinces = ['antwerpen', 'limburg-be', 'oost-vlaanderen', 'vlaams-brabant', 'west-vlaanderen'];
    const bePlaces = p.filter((x: any) => beProvinces.includes(x.province));
    const beWithPop = bePlaces.filter((x: any) => x.population !== undefined);
    console.log("Vlaanderen (BE) status:", {
        total: bePlaces.length,
        withPop: beWithPop.length
    });
}

main();
