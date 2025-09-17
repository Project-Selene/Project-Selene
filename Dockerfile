#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM --platform=$TARGETPLATFORM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS dependencies

# Install NodeJS
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && rm -rf /var/lib/apt/lists/*
ARG NODE_MAJOR=20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install nodejs -y \
    && rm -rf /var/lib/apt/lists/*

FROM dependencies AS build
    
WORKDIR /src
COPY ["ProjectSelene.Application/ProjectSelene.Application.csproj", "ProjectSelene.Application/"]
COPY ["ProjectSelene.Discord/ProjectSelene.Discord.csproj", "ProjectSelene.Discord/"]
COPY ["ProjectSelene.Domain/ProjectSelene.Domain.csproj", "ProjectSelene.Domain/"]
COPY ["ProjectSelene.Infrastructure/ProjectSelene.Infrastructure.csproj", "ProjectSelene.Infrastructure/"]
COPY ["ProjectSelene.Web/ProjectSelene.Web.csproj", "ProjectSelene.Web/"]
COPY ["Directory.Build.props", "Directory.Packages.props", "global.json", "./"]
ARG TARGETARCH
RUN dotnet restore -a $TARGETARCH "ProjectSelene.Web/ProjectSelene.Web.csproj"

COPY ["ProjectSelene.Modloader/package.json", "ProjectSelene.Modloader/tsconfig.json",  "ProjectSelene.Modloader/"]
RUN mkdir ProjectSelene.Modloader/src/ && touch ProjectSelene.Modloader/src/index.ts
COPY ["ProjectSelene.Modloader.UI/package.json", "ProjectSelene.Modloader.UI/"]
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci --ignore-scripts
COPY . .
RUN npm rebuild
WORKDIR "/src/ProjectSelene.Modloader"
RUN npm run build
WORKDIR "/src/ProjectSelene.Modloader.UI"
RUN npm run build
WORKDIR "/src/ProjectSelene.Web"
ARG TARGETARCH
RUN dotnet publish "ProjectSelene.Web.csproj" -a $TARGETARCH -c Release -o /app/publish \
    && rm -rf /app/publish/wwwroot/* \
    && cp -r ../ProjectSelene.Modloader.UI/build/* /app/publish/wwwroot/

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["/app/ProjectSelene"]