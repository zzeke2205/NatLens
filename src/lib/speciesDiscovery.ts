import { supabase } from "@/lib/supabase";

export async function discoverSpeciesFromQR(qrData: string) {
  // Accept only QR codes using the NatLens format.
  const qrPattern =
    /^natlens:\/\/species\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

  const match = qrData.trim().match(qrPattern);

  if (!match) {
    throw new Error(
      "Invalid QR code. Please scan a valid NatLens animal QR code.",
    );
  }

  const speciesId = match[1];

  // Get the currently logged-in user.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please log in before discovering animals.");
  }

  // Check whether the species exists and is published.
  const { data: species, error: speciesError } = await supabase
    .from("species")
    .select("id, common_name, scientific_name, description, cover_image_url")
    .eq("id", speciesId)
    .eq("is_published", true)
    .maybeSingle();

  if (speciesError) {
    throw speciesError;
  }

  if (!species) {
    throw new Error("Animal not found or is not currently available.");
  }

  // Add the species to the user's collection.
  const { error: insertError } = await supabase
    .from("user_species_collection")
    .insert({
      user_id: user.id,
      species_id: species.id,
    });

  // Handle an animal that has already been discovered.
  if (insertError?.code === "23505") {
    return {
      status: "already_discovered" as const,
      species,
    };
  }

  if (insertError) {
    throw insertError;
  }

  return {
    status: "discovered" as const,
    species,
  };
}
