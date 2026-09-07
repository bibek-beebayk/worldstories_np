const numbers = new Intl.NumberFormat("ne-NP", { numberingSystem: "deva" });
export const nepaliNumber = (value: number) => numbers.format(value);

// Editorial display labels only; API IDs and stored catalogue metadata stay intact.
const genres: Record<string, string> = {
  adventure: "साहसिक कथा",
  fantasy: "कल्पनालोक",
  folklore: "लोककथा",
  folktale: "लोककथा",
  folktales: "लोककथा",
  "folk tales": "लोककथा",
  "fairy tales": "परीकथा",
  "fairy tale": "परीकथा",
  fable: "नीतिकथा",
  fables: "नीतिकथा",
  mythology: "पौराणिक कथा",
  myth: "मिथक",
  myths: "मिथक",
  legend: "किंवदन्ती",
  legends: "किंवदन्ती",
  fiction: "आख्यान",
  "literary fiction": "साहित्यिक आख्यान",
  "historical fiction": "ऐतिहासिक आख्यान",
  "science fiction": "विज्ञान कथा",
  "non-fiction": "गैरआख्यान",
  nonfiction: "गैरआख्यान",
  mystery: "रहस्य",
  thriller: "रोमाञ्चक कथा",
  horror: "डरलाग्दा कथा",
  romance: "प्रेमकथा",
  comedy: "हास्य",
  humor: "हास्य",
  humour: "हास्य",
  satire: "व्यङ्ग्य",
  drama: "नाटक",
  poetry: "कविता",
  biography: "जीवनी",
  autobiography: "आत्मकथा",
  history: "इतिहास",
  philosophy: "दर्शन",
  religion: "धर्म",
  spiritual: "आध्यात्मिक",
  spirituality: "आध्यात्मिक",
  "children's literature": "बालसाहित्य",
  children: "बालसाहित्य",
  "children's stories": "बालकथा",
  classics: "कालजयी साहित्य",
  classic: "कालजयी साहित्य",
  gothic: "रहस्यमय साहित्य",
  "short stories": "लघुकथा",
};

export function genreLabel(name: string): string {
  // Unmapped names are catalogue content, preserved as authored in the admin.
  return genres[name.trim().toLowerCase()] || name;
}
