import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ZooDexScreen from "../components/ZooDexScreen";

const C = {
  teal: "#34857B",
  pale: "#E9F1F0",
  orange: "#FF6A48",
  white: "#FFFFFF",
  bg: "#F5F7F8",
  text: "#1C2B23",
  muted: "#8E9A94",
  border: "#E5EAE8",
  green: "#52A66A",
};
type Tab = "Home" | "ZooDex" | "Map" | "Tasks" | "Profile";
type Animal = {
  id: string;
  name: string;
  scientific: string;
  image: string;
  habitat: string;
  fact: string;
};
const ANIMALS: Animal[] = [
  {
    id: "1",
    name: "Malayan Tiger",
    scientific: "Panthera tigris jacksoni",
    image:
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=700&auto=format&fit=crop&q=80",
    habitat: "Forest habitat",
    fact: "The Malayan tiger is native to the Malay Peninsula and plays an important role in its forest ecosystem.",
  },
  {
    id: "2",
    name: "Asian Elephant",
    scientific: "Elephas maximus",
    image:
      "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=700&auto=format&fit=crop&q=80",
    habitat: "Forest and grassland",
    fact: "Asian elephants use their trunks to smell, touch, gather food, and communicate.",
  },
  {
    id: "3",
    name: "Green Turtle",
    scientific: "Chelonia mydas",
    image:
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=700&auto=format&fit=crop&q=80",
    habitat: "Tropical and subtropical oceans",
    fact: "Green turtles are marine reptiles that return to land to lay their eggs.",
  },
];
const MISSIONS = [
  {
    id: "m1",
    title: "Wildlife Starter",
    desc: "Discover an animal in the zoo.",
    reward: 30,
  },
  {
    id: "m2",
    title: "Big Cat Explorer",
    desc: "Learn about a big cat species.",
    reward: 50,
  },
  {
    id: "m3",
    title: "Curious Naturalist",
    desc: "Read three animal fact cards.",
    reward: 20,
  },
];
const REWARDS = [
  {
    id: "r1",
    title: "Zoo Sticker Pack",
    desc: "A fun souvenir sticker pack.",
    cost: 60,
    emoji: "🎟️",
  },
  {
    id: "r2",
    title: "Animal Postcard",
    desc: "A wildlife-themed postcard.",
    cost: 100,
    emoji: "💌",
  },
  {
    id: "r3",
    title: "Junior Explorer Badge",
    desc: "A special explorer badge.",
    cost: 150,
    emoji: "🏅",
  },
];
const NAV: { label: Tab; icon: string }[] = [
  { label: "Home", icon: "⌂" },
  { label: "ZooDex", icon: "▦" },
  { label: "Map", icon: "⌖" },
  { label: "Tasks", icon: "☆" },
  { label: "Profile", icon: "○" },
];

export default function HomeScreen() {
  const [tab, setTab] = useState<Tab>("Home");
  const [subPage, setSubPage] = useState<"scan" | "visitor" | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [query, setQuery] = useState("");
  const [taskSection, setTaskSection] = useState<"Missions" | "Rewards">(
    "Missions",
  );
  const [tokens, setTokens] = useState(120);
  const [collected, setCollected] = useState<string[]>(["1", "2"]);
  const [completed, setCompleted] = useState<string[]>(["m1"]);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const go = (next: Tab) => {
    setTab(next);
    setSubPage(null);
    setAnimal(null);
    setQuery("");
  };
  const filtered = useMemo(
    () =>
      ANIMALS.filter(
        (a) =>
          (tab !== "ZooDex" || collected.includes(a.id)) &&
          `${a.name} ${a.scientific}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      ),
    [tab, collected, query],
  );
  const addAnimal = (a: Animal) => {
    if (collected.includes(a.id))
      return Alert.alert(
        "Already collected",
        `${a.name} is already in your ZooDex.`,
      );
    setCollected((old) => [...old, a.id]);
    Alert.alert(
      "Added to ZooDex!",
      `${a.name} has been added to your collection.`,
    );
  };
  const finishMission = (id: string, reward: number, title: string) => {
    if (completed.includes(id))
      return Alert.alert(
        "Mission completed",
        `You have already completed ${title}.`,
      );
    setCompleted((old) => [...old, id]);
    setTokens((old) => old + reward);
    Alert.alert("Mission completed!", `You earned ${reward} tokens.`);
  };
  const redeemReward = (id: string, cost: number, title: string) => {
    if (redeemed.includes(id))
      return Alert.alert(
        "Already redeemed",
        "You have already redeemed this demo reward.",
      );
    if (tokens < cost)
      return Alert.alert(
        "Not enough tokens",
        `You need ${cost - tokens} more tokens.`,
      );
    setTokens((old) => old - cost);
    setRedeemed((old) => [...old, id]);
    Alert.alert(
      "Reward redeemed!",
      `${title} has been added to your demo redemption history.`,
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.teal} />
      {animal ? (
        <ScrollView
          style={s.page}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          <TouchableOpacity onPress={() => setAnimal(null)} style={s.back}>
            <Text style={s.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: animal.image }}
            style={s.detailImage}
            resizeMode="cover"
          />
          <View style={s.pad}>
            <Text style={s.eyebrow}>MEET THE WILDLIFE</Text>
            <Text style={s.detailTitle}>{animal.name}</Text>
            <Text style={s.scientific}>{animal.scientific}</Text>
            <Text style={s.chip}>🌿 {animal.habitat}</Text>
            <Text style={s.sectionTitle}>Did you know?</Text>
            <Text style={s.body}>{animal.fact}</Text>
            <TouchableOpacity
              style={[
                s.primaryBtn,
                collected.includes(animal.id) && s.disabled,
              ]}
              onPress={() => addAnimal(animal)}
            >
              <Text
                style={[
                  s.primaryBtnText,
                  collected.includes(animal.id) && s.disabledText,
                ]}
              >
                {collected.includes(animal.id)
                  ? "✓ Added to your ZooDex"
                  : "＋ Add to my ZooDex"}
              </Text>
            </TouchableOpacity>
            <Text style={s.note}>
              Sample animal information for the UI prototype.
            </Text>
          </View>
        </ScrollView>
      ) : subPage === "scan" ? (
        <ScrollView style={s.page} contentContainerStyle={s.pad}>
          <TouchableOpacity onPress={() => setSubPage(null)} style={s.back}>
            <Text style={s.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Heading
            title="Scan an Animal"
            subtitle="Choose how you want to discover wildlife."
          />
          <View style={s.scanPlaceholder}>
            <Text style={{ fontSize: 54 }}>📷</Text>
            <Text style={s.cardTitle}>Ready for your next discovery?</Text>
            <Text style={s.bodyCenter}>
              Camera permissions and real scanning will be connected later.
            </Text>
          </View>
          <MenuRow
            icon="▦"
            title="Scan QR Code"
            desc="Scan an animal's exhibit code"
            onPress={() =>
              Alert.alert("QR scanner", "QR scanning is not connected yet.")
            }
          />
          <MenuRow
            icon="✨"
            title="Identify with Camera"
            desc="Identify an animal using AI recognition"
            onPress={() =>
              Alert.alert(
                "AI recognition",
                "AI image recognition is not connected yet.",
              )
            }
          />
          <Text style={s.note}>
            For now, open an animal from Home or ZooDex to test the animal
            detail and collection flow.
          </Text>
        </ScrollView>
      ) : subPage === "visitor" ? (
        <ScrollView
          style={s.page}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <View style={s.subHeader}>
            <TouchableOpacity
              onPress={() => setSubPage(null)}
              style={s.backCircle}
            >
              <Text style={s.backCircleText}>‹</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.eyebrow}>PLAN YOUR VISIT</Text>
              <Text style={s.subTitle}>Visitor Information</Text>
            </View>
          </View>
          <View style={[s.pad, { paddingTop: 0 }]}>
            <View style={s.visitorHero}>
              <Text style={{ fontSize: 34 }}>🌿</Text>
              <Text style={s.cardTitle}>Make the most of your visit</Text>
              <Text style={s.body}>
                Check essential details before exploring the zoo.
              </Text>
            </View>
            <Text style={s.sectionTitle}>Essential information</Text>
            <InfoRow
              icon="📍"
              title="Address"
              value="Zoo address to be added"
            />
            <InfoRow
              icon="🕘"
              title="Opening hours"
              value="Opening and closing times to be confirmed"
            />
            <InfoRow
              icon="📞"
              title="Phone"
              value="Zoo phone number to be added"
            />
            <InfoRow
              icon="✉️"
              title="Email"
              value="Zoo email address to be added"
            />
            <InfoRow
              icon="🎟️"
              title="Admission"
              value="Ticket prices and entry details to be added"
            />
            <InfoRow
              icon="🚻"
              title="Facilities"
              value="Toilets, prayer room, food outlets and accessible facilities to be confirmed"
            />
            <InfoRow
              icon="♿"
              title="Accessibility"
              value="Accessibility information to be added"
            />
            <Text style={s.sectionTitle}>Visitor tips</Text>
            <View style={s.tip}>
              <Text style={s.cardTitle}>🌤️ Plan ahead</Text>
              <Text style={s.body}>
                Check weather conditions and official zoo updates before
                travelling.
              </Text>
            </View>
            <View style={s.tip}>
              <Text style={s.cardTitle}>🐾 Respect the animals</Text>
              <Text style={s.body}>
                Follow enclosure signs and never feed animals unless permitted.
              </Text>
            </View>
            <Text style={s.note}>
              These details are placeholders. Replace them with verified
              information for your selected zoo.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <>
          <ScrollView
            style={s.page}
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {tab === "Home" && (
              <>
                <View style={s.hero}>
                  <View style={s.header}>
                    <View>
                      <Text style={s.greeting}>Welcome back,</Text>
                      <Text style={s.name}>Haziq! 👋</Text>
                    </View>
                    <View style={s.headerBtns}>
                      <TouchableOpacity
                        style={s.iconBtn}
                        onPress={() =>
                          Alert.alert("Notifications", "You are all caught up!")
                        }
                      >
                        <Text style={{ fontSize: 21, color: C.white }}>♧</Text>
                        <View style={s.badge}>
                          <Text style={s.badgeText}>3</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.avatar}
                        onPress={() => go("Profile")}
                      >
                        <Text style={{ fontSize: 21 }}>👤</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={s.stats}>
                    <Stat label="Tokens" value={`${tokens}`} coin />
                    <Stat
                      label="Collected"
                      value={`${collected.length}/${ANIMALS.length}`}
                    />
                    <Stat label="Missions" value={`${completed.length} done`} />
                  </View>
                </View>
                <Search
                  value={query}
                  onChange={setQuery}
                  placeholder="Search animals..."
                  floating
                />
                <TouchableOpacity
                  style={s.scanCard}
                  onPress={() => setSubPage("scan")}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.scanOverline}>DISCOVER ANIMALS</Text>
                    <Text style={s.scanTitle}>SCAN ANIMAL</Text>
                    <Text style={s.scanSub}>QR Code or AI Recognition</Text>
                  </View>
                  <View style={s.cameraCircle}>
                    <Text style={{ fontSize: 25 }}>📷</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={s.mapCard} onPress={() => go("Map")}>
                  <View style={s.mapIcon}>
                    <Text style={{ fontSize: 22 }}>🗺️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>Explore the Zoo Map</Text>
                    <Text style={s.muted}>
                      Find animal habitats and facilities
                    </Text>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </TouchableOpacity>
                <Section
                  title="Continue Exploring"
                  action="See all"
                  onAction={() => go("ZooDex")}
                />
                {filtered.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.carousel}
                  >
                    {filtered.map((a) => (
                      <AnimalCard
                        key={a.id}
                        animal={a}
                        onPress={() => setAnimal(a)}
                        collected={collected.includes(a.id)}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <Empty text="No animals match your search. Try another name." />
                )}
                <Section
                  title="Active Missions"
                  action="View tasks"
                  onAction={() => go("Tasks")}
                />
                <TouchableOpacity
                  style={s.missionPreview}
                  onPress={() => go("Tasks")}
                >
                  <Text style={{ fontSize: 26 }}>🧭</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>Big Cat Explorer</Text>
                    <Text style={s.muted}>
                      Learn about a big cat and earn tokens.
                    </Text>
                  </View>
                  <Text style={s.reward}>+50 z</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.infoBanner}
                  onPress={() => setSubPage("visitor")}
                >
                  <Text style={{ fontSize: 23 }}>ℹ️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>Plan your visit</Text>
                    <Text style={s.muted}>
                      Opening hours, contact details and visitor tips
                    </Text>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </TouchableOpacity>
              </>
            )}
            {tab === "ZooDex" && <ZooDexScreen />}
            {tab === "Map" && (
              <View style={s.pad}>
                <Heading
                  title="Zoo Map"
                  subtitle="Explore the zoo and find your next discovery."
                />
                <View style={s.mapPlaceholder}>
                  <Text style={{ fontSize: 38 }}>🗺️</Text>
                  <Text style={s.cardTitle}>Your zoo map will appear here</Text>
                  <Text style={s.bodyCenter}>
                    This demo uses sample locations. An interactive map can be
                    connected later.
                  </Text>
                  <Text style={[s.pin, { top: 18, left: 20 }]}>🐅</Text>
                  <Text style={[s.pin, { bottom: 18, right: 28 }]}>🐘</Text>
                  <Text style={[s.pin, { top: 28, right: 40 }]}>🐢</Text>
                </View>
                <Text style={s.sectionTitle}>Animal habitats</Text>
                {ANIMALS.map((a, i) => (
                  <TouchableOpacity
                    key={a.id}
                    style={s.locationRow}
                    onPress={() => setAnimal(a)}
                  >
                    <View style={s.number}>
                      <Text style={s.reward}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardTitle}>{a.name}</Text>
                      <Text style={s.muted}>{a.habitat} · Sample location</Text>
                    </View>
                    <Text style={s.arrow}>›</Text>
                  </TouchableOpacity>
                ))}
                <Text style={s.note}>
                  Map locations are placeholders, not verified zoo directions.
                </Text>
              </View>
            )}
            {tab === "Tasks" && (
              <View style={s.pad}>
                <Heading
                  title="Tasks & Rewards"
                  subtitle="Complete missions, earn tokens, and redeem rewards."
                />
                <View style={s.balance}>
                  <View>
                    <Text style={s.balanceLabel}>YOUR TOKEN BALANCE</Text>
                    <Text style={s.balanceValue}>🟠 {tokens} tokens</Text>
                  </View>
                  <Text style={{ fontSize: 30 }}>🎁</Text>
                </View>
                <View style={s.segment}>
                  {(["Missions", "Rewards"] as const).map((section) => (
                    <TouchableOpacity
                      key={section}
                      style={[
                        s.segmentBtn,
                        taskSection === section && s.segmentActive,
                      ]}
                      onPress={() => setTaskSection(section)}
                    >
                      <Text
                        style={[
                          s.segmentText,
                          taskSection === section && s.segmentTextActive,
                        ]}
                      >
                        {section}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {taskSection === "Missions"
                  ? MISSIONS.map((m) => {
                      const done = completed.includes(m.id);
                      return (
                        <View key={m.id} style={s.taskCard}>
                          <Text style={{ fontSize: 25 }}>🧭</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>{m.title}</Text>
                            <Text style={s.muted}>{m.desc}</Text>
                            <Text style={s.reward}>
                              Reward: +{m.reward} tokens
                            </Text>
                            <TouchableOpacity
                              style={[s.smallBtn, done && s.disabled]}
                              onPress={() =>
                                finishMission(m.id, m.reward, m.title)
                              }
                            >
                              <Text
                                style={[s.smallBtnText, done && s.disabledText]}
                              >
                                {done ? "Completed ✓" : "Complete demo mission"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  : REWARDS.map((r) => {
                      const done = redeemed.includes(r.id);
                      const enough = tokens >= r.cost;
                      return (
                        <View key={r.id} style={s.taskCard}>
                          <Text style={{ fontSize: 28 }}>{r.emoji}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>{r.title}</Text>
                            <Text style={s.muted}>{r.desc}</Text>
                            <Text style={s.reward}>Cost: {r.cost} tokens</Text>
                            <TouchableOpacity
                              style={[
                                s.smallBtn,
                                (done || !enough) && s.disabled,
                              ]}
                              onPress={() =>
                                redeemReward(r.id, r.cost, r.title)
                              }
                            >
                              <Text
                                style={[
                                  s.smallBtnText,
                                  (done || !enough) && s.disabledText,
                                ]}
                              >
                                {done
                                  ? "Redeemed ✓"
                                  : enough
                                    ? "Redeem reward"
                                    : "Not enough tokens"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                <Text style={s.note}>
                  Demo only: progress and tokens remain in screen state for this
                  session.
                </Text>
              </View>
            )}
            {tab === "Profile" && (
              <View style={s.pad}>
                <Heading
                  title="Your Profile"
                  subtitle="Keep track of your NatLens journey."
                />
                <View style={s.profileCard}>
                  <View style={s.profileAvatar}>
                    <Text style={{ fontSize: 38 }}>👤</Text>
                  </View>
                  <Text style={s.detailTitle}>Wildlife Explorer</Text>
                  <Text style={s.muted}>Citizen explorer · Demo profile</Text>
                  <View style={s.profileStats}>
                    <StatSmall
                      value={`${collected.length}`}
                      label="Collected"
                    />
                    <StatSmall value={`${completed.length}`} label="Missions" />
                    <StatSmall value={`${tokens}`} label="Tokens" />
                  </View>
                </View>
                <Text style={s.sectionTitle}>Quick links</Text>
                <MenuRow
                  icon="📖"
                  title="My ZooDex"
                  desc="View your collected animals"
                  onPress={() => go("ZooDex")}
                />
                <MenuRow
                  icon="ℹ️"
                  title="Visitor Information"
                  desc="Address, hours, contact and facilities"
                  onPress={() => setSubPage("visitor")}
                />
                <MenuRow
                  icon="🔔"
                  title="Notifications"
                  desc="View your latest updates"
                  onPress={() =>
                    Alert.alert("Notifications", "You are all caught up!")
                  }
                />
                <MenuRow
                  icon="⚙️"
                  title="Settings"
                  desc="Settings will be added later"
                  onPress={() =>
                    Alert.alert(
                      "Settings",
                      "Settings are planned for a future version.",
                    )
                  }
                />
              </View>
            )}
          </ScrollView>
          <View style={s.nav}>
            {NAV.map((item) => {
              const active = tab === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={s.navItem}
                  onPress={() => go(item.label)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${item.label}`}
                >
                  <Text style={[s.navIcon, active && s.navIconActive]}>
                    {item.icon}
                  </Text>
                  <Text style={[s.navLabel, active && s.navLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={s.pageTitle}>{title}</Text>
      <Text style={s.pageSubtitle}>{subtitle}</Text>
    </View>
  );
}
function Section({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onAction}>
        <Text style={s.link}>{action}</Text>
      </TouchableOpacity>
    </View>
  );
}
function Search({
  value,
  onChange,
  placeholder,
  floating = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  floating?: boolean;
}) {
  return (
    <View style={[s.search, floating && s.floatingSearch]}>
      <Text style={s.searchIcon}>⌕</Text>
      <TextInput
        style={s.searchInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#A0AAB2"
        returnKeyType="search"
      />
      {!!value && (
        <TouchableOpacity onPress={() => onChange("")}>
          <Text style={s.clear}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
function Stat({
  label,
  value,
  coin = false,
}: {
  label: string;
  value: string;
  coin?: boolean;
}) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        {coin && <Text style={{ color: C.orange }}>●</Text>}
        <Text style={s.statValue}>{value}</Text>
      </View>
    </View>
  );
}
function StatSmall({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={s.statSmallValue}>{value}</Text>
      <Text style={s.muted}>{label}</Text>
    </View>
  );
}
function AnimalCard({
  animal,
  onPress,
  collected,
}: {
  animal: Animal;
  onPress: () => void;
  collected: boolean;
}) {
  return (
    <TouchableOpacity
      style={s.animalCard}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <Image
        source={{ uri: animal.image }}
        style={s.animalImage}
        resizeMode="cover"
      />
      <View style={s.animalInfo}>
        <Text style={s.animalName} numberOfLines={1}>
          {animal.name}
        </Text>
        <Text style={[s.animalBadge, { color: collected ? C.green : C.teal }]}>
          {collected ? "✓ In ZooDex" : "View details"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 28 }}>🔎</Text>
      <Text style={s.bodyCenter}>{text}</Text>
    </View>
  );
}
function MenuRow({
  icon,
  title,
  desc,
  onPress,
}: {
  icon: string;
  title: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.8}>
      <View style={s.menuIcon}>
        <Text style={{ fontSize: 21 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{title}</Text>
        <Text style={s.muted}>{desc}</Text>
      </View>
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );
}
function InfoRow({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <View style={s.infoRow}>
      <View style={s.menuIcon}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{title}</Text>
        <Text style={s.muted}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  page: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 22 },
  pad: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 28 },
  hero: {
    backgroundColor: C.teal,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 44,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  name: { color: C.white, fontSize: 30, fontWeight: "900", marginTop: 3 },
  headerBtns: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: C.orange,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: C.white, fontSize: 10, fontWeight: "900" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F5C988",
    alignItems: "center",
    justifyContent: "center",
  },
  stats: { flexDirection: "row", gap: 9 },
  stat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 5,
  },
  statValue: { color: C.white, fontSize: 18, fontWeight: "900" },
  search: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 22,
  },
  floatingSearch: {
    marginHorizontal: 24,
    marginTop: -26,
    marginBottom: 0,
    zIndex: 2,
    elevation: 4,
    borderRadius: 19,
    height: 54,
  },
  searchIcon: { color: "#A0AAB2", fontSize: 25, marginRight: 10 },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  clear: { color: C.muted, fontSize: 23, paddingHorizontal: 4 },
  scanCard: {
    backgroundColor: C.orange,
    borderRadius: 25,
    marginHorizontal: 24,
    marginTop: 22,
    marginBottom: 15,
    padding: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scanOverline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  scanTitle: {
    color: C.white,
    fontSize: 26,
    fontWeight: "900",
    marginVertical: 5,
  },
  scanSub: { color: C.white, fontSize: 12, fontWeight: "600" },
  cameraCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.23)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  mapCard: {
    backgroundColor: C.pale,
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: 28,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#D5E5E3",
  },
  mapIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  muted: { color: C.muted, fontSize: 12, lineHeight: 18 },
  arrow: { color: C.teal, fontSize: 28, fontWeight: "300" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 13,
  },
  link: { color: C.teal, fontSize: 13, fontWeight: "800" },
  carousel: { paddingHorizontal: 24, gap: 14, paddingBottom: 5 },
  animalCard: {
    width: 155,
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 5,
  },
  animalImage: { width: "100%", height: 120, backgroundColor: "#EAEAEA" },
  animalInfo: { padding: 11, alignItems: "center" },
  animalName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
  },
  animalBadge: { fontSize: 11, fontWeight: "800" },
  missionPreview: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 14,
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reward: { color: C.teal, fontSize: 12, fontWeight: "900", marginTop: 7 },
  infoBanner: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 14,
    backgroundColor: "#FFF0E8",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nav: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 9,
    paddingBottom: 7,
    paddingHorizontal: 6,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 2,
  },
  navIcon: { color: "#A0AAB2", fontSize: 23 },
  navIconActive: { color: C.teal },
  navLabel: { color: "#A0AAB2", fontSize: 10, fontWeight: "600" },
  navLabelActive: { color: C.teal, fontWeight: "900" },
  pageTitle: {
    color: C.text,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
  },
  pageSubtitle: { color: C.muted, fontSize: 13, lineHeight: 20 },
  progressCard: {
    backgroundColor: C.white,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8EFEC",
    overflow: "hidden",
    marginTop: 12,
  },
  fill: { height: "100%", backgroundColor: C.teal },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  empty: {
    alignItems: "center",
    gap: 10,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 22,
  },
  bodyCenter: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  mapPlaceholder: {
    height: 235,
    backgroundColor: "#E5F0E9",
    borderRadius: 22,
    marginBottom: 25,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#C9DED1",
  },
  pin: {
    position: "absolute",
    fontSize: 24,
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: "hidden",
    padding: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    gap: 11,
    borderWidth: 1,
    borderColor: C.border,
  },
  number: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  balance: {
    backgroundColor: C.teal,
    borderRadius: 19,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 19,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  balanceValue: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 6,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#E9EFEC",
    borderRadius: 13,
    padding: 4,
    marginBottom: 22,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  segmentActive: { backgroundColor: C.white, elevation: 2 },
  segmentText: { color: C.muted, fontSize: 14, fontWeight: "700" },
  segmentTextActive: { color: C.teal },
  taskCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  smallBtn: {
    backgroundColor: C.teal,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  smallBtnText: { color: C.white, fontSize: 11, fontWeight: "900" },
  disabled: { backgroundColor: "#E9EEEB" },
  disabledText: { color: "#718076" },
  note: {
    color: "#79663A",
    backgroundColor: "#FFF8E8",
    borderColor: "#F2E2B8",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
    marginBottom: 8,
  },
  profileCard: {
    backgroundColor: C.white,
    borderRadius: 21,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: C.border,
  },
  profileAvatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#F5D7B0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileStats: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 16,
    marginTop: 18,
  },
  statSmallValue: {
    color: C.teal,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 4,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  backCircleText: { color: C.teal, fontSize: 32, lineHeight: 36 },
  eyebrow: {
    color: C.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  subTitle: { color: C.text, fontSize: 22, fontWeight: "900" },
  visitorHero: {
    backgroundColor: C.pale,
    padding: 20,
    borderRadius: 21,
    marginBottom: 24,
  },
  body: { color: "#536259", fontSize: 13, lineHeight: 21, marginTop: 5 },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.white,
    padding: 13,
    borderRadius: 15,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: C.border,
  },
  tip: {
    backgroundColor: C.white,
    padding: 14,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  scanPlaceholder: {
    alignItems: "center",
    padding: 25,
    borderRadius: 22,
    backgroundColor: C.pale,
    marginBottom: 18,
  },
  back: { paddingHorizontal: 22, paddingVertical: 15, alignSelf: "flex-start" },
  backText: { color: C.teal, fontSize: 16, fontWeight: "800" },
  detailImage: { width: "100%", height: 275, backgroundColor: "#EAEAEA" },
  detailTitle: {
    color: C.text,
    fontSize: 27,
    fontWeight: "900",
    marginBottom: 4,
  },
  scientific: { color: C.muted, fontSize: 14, fontStyle: "italic" },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: C.pale,
    color: C.teal,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 15,
    overflow: "hidden",
  },
  primaryBtn: {
    backgroundColor: C.teal,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },
  primaryBtnText: { color: C.white, fontSize: 14, fontWeight: "900" },
});
