import Image from "next/image";

export default function FeaturesSection() {
  const features = [
    {
      title: "リスト機能",
      description: "自分が登録したい散歩ルートをリスト化して保存できます。",
      gif: "/list-feature.gif", // GIFのパス
    },
    {
      title: "おすすめ機能",
      description: "他のユーザーがおすすめしたいルートを共有できます。",
      gif: "/recommend-feature.gif", // GIFのパス
    },
    {
      title: "アウトプット機能",
      description: "共有した散歩ルートをまとめてアウトプットすることが可能です。",
      gif: "/output-feature.gif", // GIFのパス
    },
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">散歩シェアの特色</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center"
            >
              {/* GIF画像 */}
              <Image
                src={feature.gif}
                alt={feature.title}
                width={240}
                height={160}
                className="rounded-md mb-4"
              />
              {/* タイトル */}
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              {/* 説明 */}
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
